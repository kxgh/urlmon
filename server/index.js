require('dotenv').config({path: '.env'});
require("@babel/register")();
import App from "./app"

export const app = App.begin();