const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");

const Event = require("./models/event");

const app = express();

app.use(bodyParser.json());

app.use(
  "/graphql",
  graphqlHttp({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(inputOfEvent: EventInput): Event
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
      //resolver
      events: async () => {
        try {
          const eventsData = await Event.find();
          return eventsData;
        } catch (err) {
          console.log(err);
          throw err;
        }
      },
      createEvent: args => {
        const event = new Event({
          title: args.inputOfEvent.title,
          description: args.inputOfEvent.description,
          price: +args.inputOfEvent.price,
          date: new Date(args.inputOfEvent.date)
        });
        return event
          .save()
          .then(res => {
            console.log(res);
            return { ...res._doc };
          })
          .catch(err => {
            console.log(err);
            throw err;
          });
      }
    },
    graphiql: true
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-hanrf.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
