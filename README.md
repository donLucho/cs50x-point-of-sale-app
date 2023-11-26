# Cs50x Point-of-sale App (Final)


## Description
Cs50x final project 2023 submitted by Luis Artavia.


## Important Links
###### Video (unlisted): [https://www.youtube.com](https://www.youtube.com)
###### Source code: [github](https://github.com/donLucho/cs50x-point-of-sale-app)
##

## My audience(s)
First, the staff at Harvard Cs50 and/or at Ed-X is **my main audience**; in other words, whoever is responsible for evaluating my work and for giving me credit for completion of this course is **my primary audience**. Then, anybody in the not-too-distant future that is interested in exploring similar themes (such as Netlify, Aiven, Sequelize, CRA, etc.) they, too, are welcome to snoop around.


## Synopsis
In essence, this is a custom&#45;built, simulated point of sale application that uses ***[Create React App](https://create-react-app.dev/ "link to CRA")*** on the front-end; ***[Netlify](https://www.netlify.com/ "link to netlify")*** (in lieu of ExpressJS) to act as the back-end with the help of ***[Sequelize](https://sequelize.org/ "link to sequelize")*** ORM (object relational mapping tool) to facilitate communication with your database serve of choice; and, ***[MySQL](https://dev.mysql.com/doc/ "link to MySQL documentation")*** as the database server language of choice with the help of ***[aiven](https://aiven.io/ "link to aiven")*** to step in as the publicly accessible data platform.


## Different phases in the production of this project
In general, the work came in two phases: the pre-work (discovery) and the development stages. The former was constituted of banal tasks such as gathering bookmarks, doing research and watching videos. That began on Sunday, 10/22/2023. Then, from Monday, 10/30/2023 to Saturday, 11/25/2023 the time was spent in putting together the project. This was done in phases as new technologies were brought and other proposed technologies were &quot;left on the cutting room floor.&quot; 


## What was ditched?!?!
From 11/11/2023 to 11/21/2023, a considerable amount of energy was devoted to [ably](https://ably.com/ "link to ably"). Based on [a search-engine result that took me to netlify](https://www.netlify.com/integrations/ably/ "link to ntl"), I was confident that websockets for free would be a thing. In the end, I exceeded my allotted quota and decided it would be more practical to ditch websockets for netlify rather than burn through multiple email addresses in order to include websockets at all.


## What I liked most about this project
I enjoyed using Aiven -- this was a first for me. I never knew that it existed previous to beginning my research. Aiven will likely be my database provider for the forseeable future. As a result, I will likely learn how to program in PostgreSQL and go from there. 


## Project background
You are the owner of a small-business and you need to track inventory, as well as, track purchases. You can also search total sales by date and basically keep a pulse on the progress of your small-business. 


### Organization of said project
The project has front and back ends and makes use of two distinct providers of SAAS and PAAS (software or platform as a service). 


#### Webpage
The website is constituted of several pages including:
1. **login:** Page for logging in existing users;
2. **register:** Page for registering new users;
3. **index (point-of-sales):** Page to perform sales and complete transactions;
4. **inventory:** Page for viewing, adding and editing inventory items;
5. **transactions:** Page for viewing all transactions;
6. **livecart:** Page for searching transactions by date;
7. **transaction:** Page for viewing a specific transaction;
8. **product:** Page for viewing a specific product;


#### Database
For illustration, I have included a sample database to be found in the **supporting_material** folder. You will find that the database includes three tables. Although primary keys are established **no relationships** have been established for use with any anticipated foreign-keys. Only the *inventory* table has been populated with some sample data. The tables are as follows:

 - **inventory.** Table to organize the inventory:
    * *id:* unique key, primary key, binary data-type (UUID, version 1 for use with MySQL);
    * *name:* varchar data-type, contains the product name;
    * *price:* float data-type, contains the price of the product;
    * *quantity:* integer data-type, contains the amount on hand of said product;

 - **transactions.** Table to organize the transactions:
    * *id:* unique key, primary key, binary data-type (UUID, version 1 for use with MySQL);
    * *date:* DATETIME data-type, tracks the date and time of a purchase;
    * *total:* float data-type, tracks the sub-total excluding the sales tax;
    * *items:* longtext data-type, contains a string encapsulating all of the items purchased in a single transaction;
    * *tax:* float data-type, tracks the amount of sales tax;

 - **users.** Table to track the users (employees):
    * *id:* unique key, primary key, binary data-type (UUID, version 1 for use with MySQL);
    * *username:* varchar data-type, contains the user/employee name in plain text;
    * *email:* varchar data-type, contains the email address in plain text;
    * *password:* varchar data-type, contains the encrypted password in plain text;


#### Server Endpoints
What typically constitutes endpoints in ExpressJS instead are expressed (pun *not* intended) as lambda functions for use with Netlify. In other words, lambda functions are written in the front-end, too, along with the client and are located at **src/lambda**. The unique endpoints include:

1. **getallusers.** Receives a GET request, returns an array of users contained within a stringified object;
2. **userregister.** Receives a POST request, returns stringified object as confirmation;
3. **userlogin.** Receives a POST request, returns an encrypted token contained within a stringified object;
4. **getallproducts.** Receives a GET request, returns an array of products contained within a stringified object;
5. **createoneproduct.** Receives a POST request with a new product payload, returns stringified object as confirmation;
6. **getoneproduct.** Receives a GET request, returns an array of products **of length one** contained within a stringified object;
7. **updateoneproduct.** Receives a POST request with an updated product payload, returns stringified object as confirmation;
8. **createonetransaction.** Receives a POST request with a new transaction payload, returns stringified object as confirmation;
9. **getalltransactions.** Receives a GET request, returns an array of transactions contained within a stringified object;
10. **getcustomrange.** Receives a GET request *with two parameters*, returns an array of transactions contained within a stringified object;
11. **gettodaysnumbers.** Receives a GET request *with one parameter*, returns an array of transactions contained within a stringified object;
12. **getonetransaction.** Receives a GET request, returns an array of transactions **of length one** contained within a stringified object;


## About development

In terms of local development, there is one other thing. The lambda functions (server endpoints) are accessible through **http://localhost:8888/.netlify/functions/<your_function_filename>**. Typically, Create React App is accessible through **http://localhost:3000/**. Therefore, provided that the localhost domain is occupying two very different ports, accomodations have to be made. I needed to add a new file at **./src/setUpProxy.js** file like so:

```sh
const { createProxyMiddleware } = require('http-proxy-middleware');

const proxyCTX = '/.netlify/functions/';

const proxyMW = createProxyMiddleware(
  {
    target: 'http://localhost:8888', 
    changeOrigin: true , 
  }
);

module.exports = (app) => { app.use(proxyCTX, proxyMW); };

```

You can read up more on the subject of proxying at the [reactjs website](https://create-react-app.dev/docs/proxying-api-requests-in-development/ "link to proxy documentation").


## One other thing
For the life of me, I could not serve the build folder locally. Hence, on a leap of faith based on previous experience with lambda functions in the context of netlify, I deployed the project. If it is publicly available, then, you can presume that it worked!


## Farewell
I would like to say **thank you** to all the supporting staff and professors at Harvard Cs50. It has been quite a journey.I will not forget the experience anytime soon!