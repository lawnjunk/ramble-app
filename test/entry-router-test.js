'use strict';

//set env
process.env.APP_SECRET = 'something123';
process.env.MONGODB_URI = 'mongodb://localhost/rambletest';

const expect = require('chai').expect;
const request = require('superagent-use');
const superPromise = require('superagent-promise-plugin');
const debug = require('debug')('ramble:entry-router-test');

const authController = require('../controller/auth-controller');
const entryController = require('../controller/entry-controller');
const userController = require('../controller/user-controller');

const port = process.env.PORT || 3000;
const baseUrl = `localhost:${port}/api`;
const server = require('../server');
request.use(superPromise);

describe('testing module entry-router', function(){
  before((done) => {
    debug('before entry-router test module');
    if(!server.isRunning){
      server.listen(port, ()=>{
        server.isRunning = true;
        done();
      });
      return;
    }
    done();
  });
  after((done) =>{
    debug('afer entry-router test module');
    if(server.isRunning){
      server.close(()=>{
        server.isRunning = false;
        done();
      });
      return;
    }
    done();
  });
  describe('testing entry-router module', function(){
    beforeEach((done) => {
      authController.signup({username:'testie', password:'12345'})
      .then((user)=>{
        this.tempUser = user;
        done();
      });
    });
    afterEach((done) =>{
      Promise.all([
        entryController.removeAllEntries(),
        userController.removeAllUsers()
      ])
      .then( ()=> done())
      .catch(done);
    });
  });
  describe('testing POST module entry-router', function(){
    it('should return status 200 code',(done)=>{
      request.post(`${baseUrl}/entry`)
      .send({
        userId: this.tempUser._id,
        title: 'testing',
        keywords: 'test',
        public: true
      })
      .then(res =>{
        expect(res.status).to.equal(200);
        done();
      })
      .catch(done);
    });
  });  //end of POST module

  describe('testing for Error on POST route', ()=>{
    it('should return status code 400',(done)=>{
      request.post(`${baseUrl}/entry`)
      .send({})
      .then(res =>{
        expect(res.status).to.equal(400);
        done();
      })
      .catch(done);
    });
    it('should return status code 404',(done)=>{
      request.post(`${baseUrl}/entry`)
      .send({
        userId: 12345,
        title: 'testing',
        keywords: 'test',
        public: true
      })
      .then(res =>{
        expect(res.status).to.equal(400);
        done();
      })
      .catch(done);
    });
  });//end of error Post method
  describe('testing GET module entry-router', function(){
    before((done)=>{
      request.post(`${baseUrl}/entry`)
      .send({
        userId: this.tempUser._id,
        title: 'testing',
        keywords: 'test',
        public: true
      })
      .then(()=>{
        done();
      })
      .catch(done);
    });
    it('should return status code 200',(done)=>{
      request.get(`${baseUrl}/entry/${this.tempEntry._id}`)
      .then(res => {
        expect(res.status).to.equal(200);
        done();
      })
      .catch(done);
    });
    describe('testing for Error on GET module', function(){
      before((done)=>{
        request.post(`${baseUrl}/entry`)
        .send({})
        .then(()=>{
          done();
        })
        .catch(done);
      });
      it('should return status code 400',(done)=>{
        request.get(`${baseUrl}/entry/${this.tempEntry._id}`)
        .then(res => {
          expect(res.status).to.equal(400);
          done();
        })
        .catch(done);
      });
    });
  });//end of GET module
});//end of entry test module
