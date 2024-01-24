import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadFileOnCloud } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { COOKIE_OPTIONS } from "../constants.js";
import jwt from "jsonwebtoken";
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating access and refresh tokens"
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check user is already registred
    // check for image ( cover image and avatar)
    // upload them to cloudinary
    // create user object to store in db
    // remove password and refreshToken from response
    // check for usr creation
    // return res

    const { username, email, fullName, password } = req.body;

    if (
        [username, email, fullName, password].some(
            (filed) => filed?.trim() === ""
        )
    ) {
        return new ApiError(400, "Required fileds are missing");
    }

    const extistedUser = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (extistedUser) {
        throw new ApiError(409, "User already registered");
    }

    console.log("req.files --- ", req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;

    console.log("avatarLocalPath in user controller  --- ", avatarLocalPath);
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required local path");
    }

    const avatar = await uploadFileOnCloud(avatarLocalPath);

    console.log("Avatar image cloud URL -> ", avatar);
    if (!avatar) {
        throw new ApiError(400, "Avatar is required");
    }

    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    console.log(
        "coverImageLocalPath in user controller  --- ",
        avatarLocalPath
    );

    const coverImage = await uploadFileOnCloud(coverImageLocalPath);
    console.log("coverImage image cloud URL -> ", avatar);

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase().trim(),
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering the user"
        );
    }
    return res
        .status(201)
        .json(
            new ApiResponse(201, createdUser, "User registered Successfullly")
        );
});

const loginUser = asyncHandler(async (req, res) => {
    // request body -> data
    // username or email
    // check the password is it received or not
    // find the user
    // password validate
    // generate accessToken and refreshToken
    // send response for mobile device and cookie for supported browser

    const { username, email, password } = req.body;
    console.log("username - ", username);
    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }
    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!user) {
        throw new ApiError(404, "User does not exists!!!");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(404, "Invalid user credentials!");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    return res
        .status(200)
        .cookie("accessToken", accessToken, COOKIE_OPTIONS)
        .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in successfully!"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $unset: {
                refreshToken: 1,
            },
        },
        { new: true }
    );
    return res
        .status(200)
        .clearCookie("accessToken", COOKIE_OPTIONS)
        .clearCookie("refreshToken", COOKIE_OPTIONS)
        .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incommingRefreshToken =
        req.cookies?.refreshToken || req.body?.refreshToken;
    if (!incommingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incommingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incommingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token expired or used");
        }
        const { refreshToken, accessToken } =
            await generateAccessAndRefreshTokens(user._id);

        res.status(200)
            .cookie("accessToken", accessToken, COOKIE_OPTIONS)
            .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken,
                    },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});
export { registerUser, loginUser, logoutUser, refreshAccessToken };
