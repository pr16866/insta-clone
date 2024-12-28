import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { connectedUsers, io } from "../socket/socket.js";
// import { connectedUsers, getReceiverSocketId } from "../socket/socket.js";
// import { connectedUsers } from "../socket/socket.js";
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(401).json({
        message: "Something is missing, please check!",
        success: false,
      });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(401).json({
        message: "Try different email",
        success: false,
      });
    }
    // Check if a user with the same username already exists
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(401).json({
        message:
          "Username is already taken. Please choose a different username.",
        success: false,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      username,
      email,
      password: hashedPassword,
    });
    return res.status(201).json({
      message: "Account created successfully.",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({
        message: "Something is missing, please check!",
        success: false,
      });
    }
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Incorrect  password",
        success: false,
      });
    }

    const token = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "5h",
    });

    // populate each post if in the posts array
    const populatedPosts = await Promise.all(
      user.posts.map(async (postId) => {
        const post = await Post.findById(postId);
        if (post.author.equals(user._id)) {
          return post;
        }
        return null;
      })
    );
    user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      posts: populatedPosts,
    };
    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: `Welcome back ${user.username}`,
        success: true,
        user,
      });
  } catch (error) {
    console.log(error);
  }
};

export const logout = async (_, res) => {
  try {
    return res.cookie("token", "", { maxAge: 0 }).json({
      message: "Logged out successfully.",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};
export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    let user = await User.findById(userId)
      .populate({ path: "posts", createdAt: -1 })
      .populate("bookmarks");
    return res.status(200).json({
      user,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const editProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { bio, gender } = req.body;
    const profilePicture = req.file;
    let cloudResponse;

    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);
      cloudResponse = await cloudinary.uploader.upload(fileUri);
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }
    if (bio) user.bio = bio;
    if (gender) user.gender = gender;
    if (profilePicture) user.profilePicture = cloudResponse.secure_url;

    await user.save();

    return res.status(200).json({
      message: "Profile updated.",
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select(
      "-password"
    );
    if (!suggestedUsers) {
      return res.status(400).json({
        message: "Currently do not have any users",
      });
    }
    return res.status(200).json({
      success: true,
      users: suggestedUsers,
    });
  } catch (error) {
    console.log(error);
  }
};

export const followOrUnfollow = async (req, res) => {
  try {
    const followKrneWala = req.id;
    const jiskoFollowKrunga = req.params.id;
    // console.log(getReceiverSocketId())
    // console.log("connectedUsers", connectedUsers);
    const followerSocketId = connectedUsers[followKrneWala];
    const followeeSocketId = connectedUsers[jiskoFollowKrunga];
    if (followKrneWala === jiskoFollowKrunga) {
      return res.status(400).json({
        message: "You cannot follow/unfollow yourself",
        success: false,
      });
    }

    const user = await User.findById(followKrneWala);
    const targetUser = await User.findById(jiskoFollowKrunga);

    if (!user || !targetUser) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }
    // mai check krunga ki follow krna hai ya unfollow
    const isFollowing = user.following.includes(jiskoFollowKrunga);
    if (isFollowing) {
      // unfollow logic ayega
      await Promise.all([
        User.updateOne(
          { _id: followKrneWala },
          { $pull: { following: jiskoFollowKrunga } }
        ),
        User.updateOne(
          { _id: jiskoFollowKrunga },
          { $pull: { followers: followKrneWala } }
        ),
      ]);
      // Emit event to both users
      if (followerSocketId) {
        // 
        io.to(followerSocketId).emit("followStatusChanged", {
          jiskoFollowKrunga,
          followKrneWala,
          followed: false,
        });
      }
    //   
      if (followeeSocketId) {
        io.to(followeeSocketId).emit("followStatusChanged", {
          jiskoFollowKrunga,
          followKrneWala,
          followed: false,
        });
      }


      return res
        .status(200)
        .json({ message: "Unfollowed successfully", success: true ,followed:false});
    } else {
      // follow logic ayega
      await Promise.all([
        User.updateOne(
          { _id: followKrneWala },
          { $push: { following: jiskoFollowKrunga } }
        ),
        User.updateOne(
          { _id: jiskoFollowKrunga },
          { $push: { followers: followKrneWala } }
        ),
      ]);
      // Emit event to both users
      if (followerSocketId) {
        io.to(followerSocketId).emit("followStatusChanged", {
          jiskoFollowKrunga,
          followKrneWala,
          followed: true,
        });
      }

      if (followeeSocketId) {
        io.to(followeeSocketId).emit("followStatusChanged", {
          jiskoFollowKrunga,
          followKrneWala,
          followed: true,
        });
      }
      return res
        .status(200)
        .json({ message: "followed successfully", success: true,followed:true });
    }
  } catch (error) {
    console.log(error);
  }
};
export const getFollowersAndFollowing = async (req, res) => {
    try {
      const userId = req.params.id;
  
      // Find the user by their ID and populate both followers and following fields
      const user = await User.findById(userId)
        .populate("followers", "username email profilePicture bio gender") // Include specific fields for followers
        .populate("following", "username email profilePicture bio gender"); // Include specific fields for following
  
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      // Return both followers and following
      return res.status(200).json({
        success: true,
        followers: user.followers,
        following: user.following,
      });
    } catch (error) {
      console.error("Error fetching followers and following:", error);
      return res.status(500).json({ success: false, message: "Server Error" });
    }
  };
  