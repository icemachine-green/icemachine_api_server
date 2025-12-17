/**
 * @file app/controllers/users.controller.js
 * @description 유저 관련 컨트롤러
 * 251216 v1.0.0 Lee init
 */
import usersService from "../services/users.service.js";
import { createBaseResponse } from "../utils/createBaseResponse.util.js";
import { SUCCESS } from "../../configs/responseCode.config.js";

async function signup(req, res, next) {
  try {
    const { email, password, name, phone_number, role, address, provider, social_id, profile_image_url } = req.body;

    const newUser = await usersService.signup(
      email,
      password,
      name,
      phone_number,
      role,
      address,
      provider,
      social_id,
      profile_image_url
    );

    return res
      .status(SUCCESS.status)
      .send(createBaseResponse(SUCCESS, newUser));
  } catch (err) {
    console.error(err);
    if (err.status) {
      return res.status(err.status).send(createBaseResponse(err));
    }
    next(err);
  }
}

export default { signup };
