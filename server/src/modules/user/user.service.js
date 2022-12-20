import Joi from "joi";

export const UserSchema = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().min(6),
  salt: Joi.string(),
  roles: Joi.string(),
  provider: Joi.string(),
  provider_id: Joi.string(),
});

export class UserModel {
  static CreateWithBasicAuth(email, password, salt, roles) {
    return new UserModel({ email, password, salt, roles });
  }

  static CreateWithOauth(email, provider, provider_id, roles) {
    return new UserModel({ email, provider, provider_id, roles });
  }
  constructor({ email, password, salt, roles, provider, provider_id }) {
    // TODO: add further input validation. e.g. roles = comma delimited non-dupes
    if (provider) {
      this.provider = provider;
      this.provider_id = provider_id;
    } else {
      this.password = password;
      this.salt = salt;
    }

    this.email = email;
    this.roles = roles;
  }

  validate() {
    const validationResult = UserSchema.validate(this);
    return validationResult?.error;
  }
}

export class UserService {
  constructor(db) {
    this.db = db;
    this.tableName = "app_auth.users";
  }

  async getByEmail(email) {
    const user = await this.db(this.tableName).where("email", email).first();
    return user;
  }

  async getById(id) {
    return await this.db(this.tableName).where("id", id).first();
  }

  async getByProviderId(id) {
    return await this.db(this.tableName).where("provider_id", id).first();
  }

  async insert(user) {
    const err = user.validate();
    if (err) {
      return err;
    }
    await this.db(this.tableName).insert(user);
  }

  async getAllUsers() {
    return await this.db(this.tableName);
  }
}
