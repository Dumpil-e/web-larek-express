import { celebrate, Joi, Segments } from 'celebrate';

export const validateProductBody = celebrate({
  [Segments.BODY]: Joi.object().keys({
    title: Joi.string().min(2).max(30).required(),
    image: Joi.object({
      fileName: Joi.string().required(),
      originalName: Joi.string().required(),
    }),
    category: Joi.string().required(),
    description: Joi.string(),
    price: Joi.number().allow(null),
  }),
});

export const validateOrderBody = celebrate({
  [Segments.BODY]: Joi.object().keys({
    payment: Joi.string().valid('card', 'online').required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    total: Joi.number().required(),
    items: Joi.array().items(Joi.string()).min(1).required(),
  }),
});

export const validateObjId = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().hex().length(24).required(),
  }),
});

export const validateProductUpdate = celebrate({
  [Segments.BODY]: Joi.object().keys({
    title: Joi.string().min(2).max(30),
    image: Joi.object({
      fileName: Joi.string(),
      originalName: Joi.string(),
    }),
    category: Joi.string(),
    description: Joi.string(),
    price: Joi.number().allow(null),
  }),
});

export const validateUserBody = celebrate({
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
});
