'use strict';

module.exports=[
    require('./crudRoutes'),
    require('./userRoutes/userRegister'),
    require('./userRoutes/userLogin'),
    require('./userRoutes/userLogout'),
    require('./tweetRoutes/displayTweets'),
    require('./tweetRoutes/tweet'),
    require('./userRoutes/editProfileRoute'),
    require('./userRoutes/seeProfileRoute'),
    require('./tweetRoutes/followUnfollow'),
    require('./adminRoutes/adminRegisterRoute'),
    require('./adminRoutes/adminLoginRoute'),
    require('./adminRoutes/adminLogoutRoute'),
    require('./adminRoutes/seeUser'),
    require('./adminRoutes/deleteTweetRoute'),
    require('./adminRoutes/deleteUserRoute'),
    require('./adminRoutes/editUserProfile')
];
