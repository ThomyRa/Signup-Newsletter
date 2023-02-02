"use strict";

require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const https = require("node:https");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/signup.html`);
});

app.post("/", (req, res) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;

  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
      },
    ],
  };

  const jsonData = JSON.stringify(data);

  const url = `https://${process.env.MAILCHIMP_SERVER}.api.mailchimp.com/3.0/lists/${process.env.LIST_ID}`;
  const options = {
    method: "POST",
    auth: `${process.env.AUTH_USER}:${process.env.API_KEY}-${process.env.MAILCHIMP_SERVER}`,
  };

  const request = https.request(url, options, (response) => {
    response.on("data", (data) => {
      console.log(JSON.parse(data));
      console.log(response.statusCode);

      if (response.statusCode === 200) {
        res.sendFile(`${__dirname}/success.html`);
      } else {
        res.sendFile(`${__dirname}/failure.html`);
      }
    });
  });

  request.write(jsonData);
  request.end();
});

app.post("/failure", (req, res) => {
  res.redirect("/");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port 3000...");
});
