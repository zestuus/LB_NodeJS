const User = require("../models/user");
const LocalStrategy = require("passport-local").Strategy;

module.exports = passport => {
	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	passport.deserializeUser((id, done) => {
		User.findById(id, (err, user) => {
			done(err, user);
		});
	});
	passport.use(
		"local.signup",
		new LocalStrategy(
			{
				usernameField: "email",
				passwordField: "password",
				passReqToCallback: true
			},
			(req, email, password, done) => {
				User.findOne({ email: email }, (err, user) => {
					if (err) {
						return done(err);
					}
					if (user) {
						return done(null, false, {
							message: "This e-mail already used!"
						});
					}
					var newUser = new User();
					newUser.email = email;
					newUser.password = newUser.encryptPassword(password);
					newUser.save((err, result) => {
						if (err) {
							return done(err);
						}
						return done(null, newUser);
					});
				});
			}
		)
	);
	passport.use(
		"local.login",
		new LocalStrategy(
			{
				usernameField: "email",
				passwordField: "password",
				passReqToCallback: true
			},
			(req, email, password, done) => {
				User.findOne({ email: email }, (err, user) => {
					if (err) {
						return done(err);
					}
					if (!user) {
						return done(null, false, { message: "No user found!" });
					}
					if (!user.validPassword(password, user)) {
						return done(null, false, {
							message: "Wrong password!"
						});
					}
					return done(null, user);
				});
			}
		)
	);
};
