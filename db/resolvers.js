const Users = require("../models/User");
const Posts = require("../models/Post");
const Hearths = require("../models/Hearth");
const Follows = require("../models/Follows");
const Followers = require("../models/Followers");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: ".env" });

const crearToken = (usuario, secreto, expiresIn) => {
  const { id, user, image, personalemail, name, lastname } = usuario;

  return jwt.sign({ id, user, image, personalemail, name, lastname }, secreto, {
    expiresIn,
  });
};

//Resolver
const resolvers = {
  Query: {
    /*------------------Query de Usuario------------------*/

    getUser: async (_, { input }, ctx) => {
      const { user } = input;
      if (ctx.usuario) {
        try {
          const User = await Users.findOne({
            user: user,
          });
          return User;
        } catch (error) {
          console.log("Error: ", error);
        }
      } else {
        return "404";
      }
    },

    /*------------------Query de Posts------------------*/

    getPost: async (_, { id }, ctx) => {
      if (ctx.usuario) {
        try {
          const post = await Posts.findById(id);
          return post;
        } catch (error) {
          console.log("Error: ", error);
        }
      } else {
        return "404";
      }
    },

    allUserPost: async (_, { input }, ctx) => {
      const { user } = input;
      if (ctx.usuario) {
        try {
          const User = await Users.findOne({
            user: user,
          });

          const post = await Posts.find({
            iduser: User && User.id,
          });
          return post;
        } catch (error) {
          console.log("Error: ", error);
        }
      } else {
        return [];
      }
    },

    /*------------------Query de Follows------------------*/

    allUserFollows: async (_, { input }, ctx) => {
      const { user } = input;
      if (ctx.usuario) {
        try {
          const User = await Users.findOne({
            user: user,
          });

          const follows = await Follows.find({
            iduser: User && User.id,
          });
          return follows;
        } catch (error) {
          console.log("Error: ", error);
        }
      } else {
        return [];
      }
    },

    /*------------------Query de Followers------------------*/

    allUserFollowers: async (_, { input }, ctx) => {
      const { user } = input;
      if (ctx.usuario) {
        try {
          const User = await Users.findOne({
            user: user,
          });

          const follows = await Followers.find({
            iduser: User && User.id,
          });
          return follows;
        } catch (error) {
          console.log("Error: ", error);
        }
      } else {
        return [];
      }
    },

    /*------------------Query de MyFollowers------------------*/

    getMyFollowers: async (_, {}, ctx) => {
      if (ctx.usuario) {
        try {
          const follows = await Follows.find({
            iduser: ctx.usuario.id,
          });
          return follows;
        } catch (error) {
          console.log("Error: ", error);
        }
      } else {
        return [];
      }
    },
  },

  Mutation: {
    /*------------------Mutation de Loggeo------------------*/

    /**
     * Auth Usuario
     * @param {*} _
     * @param {*} input
     */

    authUser: async (_, { input }) => {
      const { personalemail, password } = input;

      //Si usuario existe
      const existeUsuario = await Users.findOne({ personalemail });

      if (!existeUsuario) {
        throw new Error("El correo NO existe");
      }

      //Revisar si existe el password
      const passwordCorrecto = await bcryptjs.compare(
        password,
        existeUsuario.password
      );

      if (!passwordCorrecto) {
        throw new Error("La contraseña es incorrecta");
      }

      //Crear Token
      return {
        token: crearToken(existeUsuario, process.env.SECRET, "24h"),
      };
    },

    /*------------------Mutation de Usuarios------------------*/

    newUser: async (_, { input }, ctx) => {
      const { personalemail, user } = input;

      let BuscarCorreo = await Users.findOne({ personalemail: personalemail });
      if (BuscarCorreo) {
        throw new Error("El correo ya existe");
      }

      let BuscarUsuario = await Users.findOne({ user: user });
      if (BuscarUsuario) {
        throw new Error("El usuario ya existe");
      }

      try {
        if (input.password !== "") {
          //Encriptar contraseña
          const salt = await bcryptjs.genSalt(10);
          input.password = await bcryptjs.hash(input.password, salt);
        }

        //Guardar en la base de datos
        const users = new Users(input);
        users.save();

        return users;
      } catch (error) {
        console.log("Error: ", error);
      }
    },

    updateUser: async (_, { id, input }, ctx) => {
      if (ctx.usuario) {
        //Revsar si existe
        let users = await Users.findById(id);

        if (!users) {
          throw new Error("Usuario no existe");
        }

        //Encriptar contraseña
        const { password } = input;
        const salt = await bcryptjs.genSalt(10);
        input.password = await bcryptjs.hash(password, salt);

        input.modifieddate = Date.now();

        //Guardarlo en la base de datos
        users = await Users.findOneAndUpdate({ _id: id }, input, {
          new: true,
        });

        return users;
      }
    },

    /*------------------Mutation de Posts------------------*/

    newPost: async (_, { input }, ctx) => {
      if (ctx.usuario) {
        //Verificar si el usuario ha registrado su primer post
        const buscar = await Posts.find({
          iduser: ctx.usuario.id,
        });

        if (buscar.length === 0) {
          try {
            const { image, description } = input;
            const insertpost = {
              iduser: ctx.usuario.id,
              posts: {
                image: image,
                description: description,
              },
            };
            const post = new Posts(insertpost);
            post.save();
          } catch (error) {
            console.log("error:", error);
          }
          return "Has hecho tu primer post";
        } else {
          const { image, description } = input;
          insertpost = {
            image: image,
            description: description,
          };

          post = await Posts.updateOne(
            { iduser: ctx.usuario.id },
            { $push: { posts: insertpost } }
          );
          return "Has hecho otro post";
        }
      }
    },

    /* newPost: async (_, { input }, ctx) => {
      if (ctx.usuario) {
        //Guardar en la base de datos
        try {
          const post = new Posts(input);
          post.save();

          return post;
        } catch (error) {
          console.log("Error: ", error);
        }
      }
    }, */

    /* updatePost: async (_, { id, input }, ctx) => {
      if (ctx.usuario) {
        //Revsar si existe
        let post = await Posts.findById(id);

        if (!post) {
          throw new Error("post no existe");
        }

        //Guardarlo en la base de datos
        post = await Posts.findOneAndUpdate({ _id: id }, input, {
          new: true,
        });

        return post;
      }
    },

    deletePost: async (_, { id }, ctx) => {
      if (ctx.usuario) {
        //Revsar si existe
        let post = await Posts.findById(id);

        if (!post) {
          throw new Error("Post no existe");
        }

        await Posts.findOneAndDelete({ _id: id });

        return "Post Elimiando";
      }
    }, */

    /*------------------Mutation de newHearth------------------*/

    newHearth: async (_, { input }, ctx) => {
      if (ctx.usuario) {
        const { idpost } = input;
        //Verificar si se a registrado algún corazón en el post
        const buscar = await Hearths.find({
          idpost: idpost,
        });

        if (buscar.length === 0) {
          try {
            const inserthearth = {
              idpost: idpost,
              UsersLikes: {
                iduser: ctx.usuario.id,
              },
            };
            const hearth = new Hearths(inserthearth);
            hearth.save();
          } catch (error) {
            console.log("error:", error);
          }
          return "Corazón dado";
        } else {
          inserthearth = {
            iduser: ctx.usuario.id,
          };

          const buscarHearth = await Hearths.find({
            idpost: idpost,
            "UsersLikes.iduser": ctx.usuario.id,
          });

          if (buscarHearth.length === 0) {
            hearth = await Hearths.updateOne(
              { idpost: idpost },
              { $push: { UsersLikes: inserthearth } }
            );
            return "Corazón dado";
          } else {
            throw new Error("Ya le has dado corazón a esta publicación");
          }
        }
      }
    },

    deleteHearth: async (_, { input }, ctx) => {
      if (ctx.usuario) {
        const { idpost } = input;

        //Revsar si existe
        const buscarHearth = await Hearths.find({
          idpost: idpost,
          "UsersLikes.iduser": ctx.usuario.id,
        });

        if (buscarHearth.length === 0) {
          throw new Error("No le has dado corazón");
        } else {
          delHearth = {
            iduser: ctx.usuario.id,
          };

          await Hearths.findOneAndUpdate(
            { idpost: idpost },
            { $pull: { UsersLikes: delHearth } }
          );

          return "Corazón Eliminado";
        }
      }
    },

    /*------------------Mutation de newFollow------------------*/

    newFollow: async (_, { input }, ctx) => {
      if (ctx.usuario) {
        const { iduser } = input;

        //Verificar si se a registrado algún Seguidor en el usuario
        const buscarFollow = await Follows.find({
          iduser: ctx.usuario.id,
        });

        const buscarFollower = await Followers.find({
          iduser: iduser,
        });

        if (buscarFollow.length === 0 && buscarFollower.length === 0) {
          try {
            const insertFollow = {
              iduser: ctx.usuario.id,
              follows: {
                follow_iduser: iduser,
              },
            };
            const insertFollower = {
              iduser: iduser,
              followers: {
                follower_iduser: ctx.usuario.id,
              },
            };

            const follow = new Follows(insertFollow);
            follow.save();

            const follower = new Followers(insertFollower);
            follower.save();
          } catch (error) {
            console.log("error:", error);
          }
          return "Has seguido a alguien";
        } else {
          insertFollow = {
            follow_iduser: iduser,
          };

          insertFollower = {
            follower_iduser: ctx.usuario.id,
          };

          const buscarfollow = await Follows.find({
            iduser: ctx.usuario.id,
            "follows.follow_iduser": iduser,
          });

          const buscarfollower = await Followers.find({
            iduser: iduser,
            "followers.follower_iduser": ctx.usuario.id,
          });

          if (buscarfollow.length === 0 && buscarfollower.length === 0) {
            seguido = await Follows.updateOne(
              { iduser: ctx.usuario.id },
              { $push: { follows: insertFollow } }
            );

            seguidor = await Followers.updateOne(
              { iduser: iduser },
              { $push: { followers: insertFollower } }
            );
            return "Has seguido a alguien";
          } else {
            throw new Error("Ya has seguido a esta persona");
          }
        }
      }
    },

    deleteFollow: async (_, { input }, ctx) => {
      if (ctx.usuario) {
        const { iduser } = input;
        //Revsar si existe

        const buscarfollow = await Follows.find({
          iduser: ctx.usuario.id,
          "follows.follow_iduser": iduser,
        });

        const buscarfollower = await Followers.find({
          iduser: iduser,
          "followers.follower_iduser": ctx.usuario.id,
        });

        if (buscarfollow.length === 0 && buscarfollower.length === 0) {
          throw new Error("El seguimiento no existe");
        } else {
          unFollow = {
            follow_iduser: iduser,
          };

          unFollower = {
            follower_iduser: ctx.usuario.id,
          };

          await Follows.findOneAndUpdate(
            {
              iduser: ctx.usuario.id,
              "follows.follow_iduser": iduser,
            },
            { $pull: { follows: unFollow } }
          );

          await Followers.findOneAndUpdate(
            {
              iduser: iduser,
              "followers.follower_iduser": ctx.usuario.id,
            },
            { $pull: { followers: unFollower } }
          );

          return "Seguimiento Eliminado";
        }
      }
    },
  },
};

module.exports = resolvers;
