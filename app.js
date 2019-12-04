const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql");
const { buildSchema } = require("graphql");

const app = express();

app.use(bodyParser.json());

app.use(
  "/graphql",
  graphqlHttp({
    schema: buildSchema(`
        type RootQuery {
            events: [String!]!
        }

        type RootMutation {
            createEvent(title: String): String
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
      //resolver
      events: () => {
        return ["Romantic Cooking", "Nude painting", "Hackathon"];
      },
      createEvent: args => {
        const eventTitle = args.title;
        return eventTitle;
      }
    },
    graphiql: true
  })
);

app.listen(3000);
