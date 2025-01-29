const { z } = require("zod");


const subjectSchema = z.object({
  id:z.coerce.number().optional(),
  name: z
    .string()
    .min(3, { message: "Subject must be at least 3 characters!" }),
});

module.exports = { subjectSchema };
