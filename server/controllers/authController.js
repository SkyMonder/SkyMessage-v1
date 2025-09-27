const register = async (req, res) => {
  res.json({ msg: 'Register route' });
};

const login = async (req, res) => {
  res.json({ msg: 'Login route' });
};

module.exports = { register, login };