const Users = require("../models/User");
const Posts = require("../models/Post");
const Hearths = require("../models/Hearth");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: ".env" });

const crearToken = (usuario, secreto, expiresIn) => {
  const { id, user, personalemail, name, lastname } = usuario;

  return jwt.sign({ id, user, personalemail, name, lastname }, secreto, {
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

    /**
     * allUserPost
     * @param {*} _
     * @param {*} empty
     * @param {*} context
     */

    allUserPost: async (_, {}, ctx) => {
      if (ctx.usuario) {
        try {
          const post = await Posts.find({
            iduser: ctx.usuario.id,
          });
          return post;
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
        //Verificar si se a registrado algún corazón en el post
        const { idpost } = input;
        const buscar = await Hearths.find({
          idpost: idpost,
        });

        if (buscar.length === 0) {
          try {
            const { idpost } = input;
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
          const { idpost } = input;
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
  },
};

module.exports = resolvers;
