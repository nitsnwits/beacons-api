/**
 * schema definition
 */

var moduleExports = {};

// POST /user object request body schema
moduleExports.postUserSchema = [
	{
		id: "userObject",
		type: "object",
		properties: {
			firstName: { type: "string"},
			lastName: { type: "string"},
			emailId: { type: "string", format: "email" },
			mobile: { type: "number", minLength: 3, maxLength: 36 }
		},
		required: ["emailId"]
	}
]


// Export the module json
module.exports = moduleExports;