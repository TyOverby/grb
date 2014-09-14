grb.js
======

grb.js is a client-side JavaScript library built to enable seamless interaction with a server-side data store. It allows web developers to build a versatile, synchronized document without spending time writing storage and communication code.

Creating a persistent, shared document is simple in grb.js: the client-side API consists of an ordinary JavaScript object, instrumented with proxy semantics which transmit property reads and writes to the server. The object can be shared with as many clients as desired, and writes are automatically committed to a MongoDB database when the document is no longer in use.

Perfect for hackathons, demos, and mockups, grb.js abstracts away the boilerplate storage and synchronization aspects of your multi-user web app.
