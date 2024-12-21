Instructions to setup and run project
Added depedencies:

bcrypt

express-session

connect-mongo

jest

supertest

which can be installed with, and should be installed through npm install But if that doesn't work then manually these are the added dependencies listed manually, (all in /server installs)

npm install bcrypt

npm install express-session

npm install connect-mongo

npm install --save-dev jest @shelf/jest-mongodb

npm install --save-dev supertest

npm install --save-dev @testing-library/react @testing-library/jest-dom

create 2 terminal instances, client and server. On client do 'npm install' and then 'npm run' (assuming prequesite tech is installed) On Server do 'node initializeDB.js mongodb://127.0.0.1:27017/phreddit' then 'node server.js' (assuming prequesite tech is installed like mongodb community which should be running)

Admin Account
An Admin account is already created when you run 'node initializeDB.js mongodb://127.0.0.1:27017/phreddit' with the following attributes: ``

        const adminUser = { 
        
        displayName: 'admin',
        
        firstName: 'Admin',
        
        lastName: 'User',
        
        email: 'admin@phreddit.com',
        
        password: 'adminpass123', 
        
        reputation: 1000,
        
        isAdmin: true
        
    };``
You can login to this through the welcome page using the email(admin@phreddit.com) and password(adminpass123)

In the sections below, list and describe each contribution briefly.

