import { expect } from 'chai';
import sinon from 'sinon';
import authMiddleware from '../middleware/isAuth.js';
import jwt from 'jsonwebtoken';
import User from '../model/user.js';

describe('Auth Middleware', function() {
    afterEach(function() {
        sinon.restore(); // Restore the original function after each test
    });

    it('should attach user to req if userId is present in token', function(done) {
        const req = {
            get: function(header) {
                return 'Bearer valid-token'; // Simulate valid Authorization header with token
            }
        };

        // Stub jwt.verify to return a token with userId
        sinon.stub(jwt, 'verify').callsFake((token, secret) => {
            return { userId: '123' }; // Return an object with userId
        });

        // Mock User.findById to return a mock user object
        const mockUser = { _id: '123', name: 'Test User' };
        sinon.stub(User, 'findById').resolves(mockUser);

        authMiddleware(req, {}, (err) => {
            if (err) return done(err);
            try {
                // Assert that req.user has the userId
                expect(req).to.have.property('user');
                expect(req.user).to.have.property('_id', '123');
                done();
            } catch (error) {
                done(error);
            }
        });
    });

    it('should throw an error if userId is missing from token', function(done) {
        const req = {
            get: function(header) {
                return 'Bearer valid-token'; // Simulate valid Authorization header with token
            }
        };

        // Stub jwt.verify to return a token without userId
        sinon.stub(jwt, 'verify').callsFake((token, secret) => {
            return {}; // Return an object without userId
        });

        authMiddleware(req, {}, (err) => {
            try {
                expect(err).to.be.an('error');
                expect(err.message).to.equal('Not Authenticated');
                done();
            } catch (error) {
                done(error);
            }
        });
    });
});
