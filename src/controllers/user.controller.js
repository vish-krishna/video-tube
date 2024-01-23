import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadFileOnCloud } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
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

export { registerUser };
