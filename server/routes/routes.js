const Controller = require('../controller/database');
module.exports = function(app){
    app.post('/signup',Controller.createUser);
    app.get('/contacts/:id',Controller.getContacts)
    app.get('/user/:id',Controller.getUser)
    app.post('/send',Controller.sendMessage)
    app.post('/add',Controller.add)
    app.post('/signin',Controller.signIn);
    app.post('/signout',Controller.signout);
    app.get('/session',Controller.session);
    app.get('/date',Controller.date);
    app.get('/weekday/:date',Controller.weekday)
    app.post('/createevent',Controller.create)
    app.get('/getUserEvents/:id',Controller.getUserEvents)
    app.patch('/update',Controller.update)
    app.delete('/delete/:id',Controller.delete)
    app.post('/sentMessages',Controller.sent)
    app.post('/recMessages',Controller.rec)
    app.get('/getMessage/:mid',Controller.getMessage)
    app.delete('/deleteMessage/:mid',Controller.deleteMessage)
    app.post('/createMultiEvent',Controller.createMultiEvent)
    app.delete('/deleteMulti/:gId',Controller.deleteMulti)

    app.delete('/deleteMultiComm/:gId',Controller.deleteMulti)
    app.post('/createMultiCommEvent',Controller.createMultiCommEvent)
    app.get('/getCommunities/:id',Controller.getUserCommunities)
    app.get('/getCommEvents/:commId',Controller.getCommEvents)
    app.get('/getStatus/:id/:commId',Controller.getStatus)
    app.post('/createCommEvent',Controller.createCommEvent)
    app.post('/create',Controller.createCommunity)
    app.get('/search/:search',Controller.search)
    app.post('/join',Controller.join)
    app.get('/member/:id/:commId',Controller.isMember)
    app.delete('/leave/:id/:commId',Controller.leave)
    app.get('/members/:commId',Controller.getMembers)
    app.patch('/delegate',Controller.delegate)
    app.get('/fstatus/:fid/:id',Controller.getFriendship )
    app.get('/memberView/:eid/:uid',Controller.memberView)
    app.post('/mutuality',Controller.mutuality)

    app.get('/forum/:commId/',Controller.getCommForum)
    app.get('/posts/:fId',Controller.getPosts)
    app.post('/makePost',Controller.makePost)
    app.get('/post/:pId',Controller.getPost)
    app.post('/comment',Controller.comment)
    app.post('/ccomment',Controller.ccomment)
    app.get('/getComments/:pId',Controller.getComments)
    app.get('/getComment/:cid',Controller.getComment)
    app.patch('/upvote',Controller.uv)
    app.patch('/downvote',Controller.dv)
    app.patch('/cupvote',Controller.cuv)
    app.patch('/cdownvote',Controller.cdv)
    app.get('/commentchain/:cid',Controller.chain)
    app.get('/child/:cid',Controller.child)
}

