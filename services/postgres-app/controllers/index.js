const { generateAccessToken } = require("../helpers/jwt");
const { User, Rental, Bicycle, Category } = require("../models");
const midtransClient = require("midtrans-client");

class Controller {
  static async register(req, res, next) {
    try {
      const { email, username, password } = req.body;
      await User.create({
        email,
        username,
        password,
      });
      res.status(201).json({
        message: "Registration succeed!"
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { username, password } = req.body;
      if (!username || !password) throw { name: "ValidationError" };
      const data = await User.findOne({ where: { username } });
      if (!data) throw { name: "UserNotFound" };
      const isPasswordValid = data.verifyPassword(password);
      if (isPasswordValid) {
        var access_token = generateAccessToken(data);
      } else {
        throw { name: "FailedLogin" };
      }
      res.status(200).json({
        message: "Login succeed!",
        access_token,
        id: data.id,
        email: data.email,
        username: data.username,
      });
    } catch (error) {
      next(error);
    }
  }

  static async readCategories(req, res, next) {
    try {
      const categories = await Category.findAll();
      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  }

  static async readBicycles(req, res, next) {
    try {
      const bicycles = await Bicycle.findAll({
        include: Category,
      });
      res.status(200).json(bicycles);
    } catch (error) {
      next(error);
    }
  }

  static async readBicycleById(req, res, next) {
    try {
      const id = req.params.id;
      const bicycle = await Bicycle.findByPk(id, {
        include: Category,
      });
      if (!bicycle) throw { name: "BicycleNotFound" };
      res.status(200).json(bicycle);
    } catch (error) {
      next(error);
    }
  }

  static async startRental(req, res, next) {
    try {
      const UserId = req.user.id;
      const { travelledDistance, BicycleId } = req.body;
      const rental = await Rental.create({
        UserId,
        travelledDistance,
        BicycleId,
      });
      res
        .status(201)
        .json({ message: "Your rental is being recorded", rental });
    } catch (error) {
      next(error);
    }
  }

  static async finishRental(req, res, next) {
    try {
      const id = req.params.id;
      const username = req.user.username;
      const { travelledDistance, totalPrice } = req.body;
      await Rental.update(
        {
          status: "Completed",
          travelledDistance,
          totalPrice,
        },
        {
          where: {
            id,
          },
        }
      );
      res
        .status(200)
        .json({ message: `Thank you ${username} for using our services` });
    } catch (error) {
      next(error);
    }
  }

  static async createSnapTransaction(req, res, next) {
    try {
      const { email, username, totalPrice } = req.body;

      let snap = new midtransClient.Snap({
        // Set to true if you want Production Environment (accept real transaction).
        isProduction: false,
        serverKey: process.env.MIDTRANS_API_KEY,
      });

      const order_id = Math.random() * 1000000000000000 * 10;

      let parameter = {
        transaction_details: {
          order_id,
          gross_amount: totalPrice,
        },
        credit_card: {
          secure: true,
        },
        customer_details: {
          email,
          username,
        },
      };

      const midtransToken = await snap.createTransaction(parameter);
      res.status(201).json(midtransToken);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = Controller;
