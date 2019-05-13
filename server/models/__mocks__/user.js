let __err = null;
let __user = null;

export default {
  __setFindById(err, user) {
    __err = err;
    __user = user;
  },
  findById: jest.fn(async (id, callback) => {
    callback(__err, __user);
  })
};
