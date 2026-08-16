const { Tenant, User } = require('../models');
const generateToken = require('../utils/generateToken');
const slugify = require('../utils/slugify');
const { asyncHandler } = require('../middleware/errorHandler');

// POST /api/auth/register — creates a new tenant workspace + its owner user
const register = asyncHandler(async (req, res) => {
  const { workspaceName, name, email, password } = req.body;
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const error = new Error('An account with this email already exists');
    error.statusCode = 409;
    throw error;
  }

  const baseSlug = slugify(workspaceName);
  let slug = baseSlug;
  let suffix = 1;
  while (await Tenant.findOne({ slug })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const tenant = await Tenant.create({ name: workspaceName, slug });

  let user;
  try {
    user = await User.create({
      tenantId: tenant._id,
      name,
      email,
      password,
      role: 'owner',
    });
  } catch (err) {
    await Tenant.findByIdAndDelete(tenant._id); // roll back orphaned tenant
    throw err;
  }

  await Tenant.findByIdAndUpdate(tenant._id, { ownerId: user._id });

  const token = generateToken(user._id, tenant._id);

  res.status(201).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    tenant: { id: tenant._id, name: tenant.name, slug: tenant.slug },
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id, user.tenantId);

  res.status(200).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    tenantId: user.tenantId,
  });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findById(req.user.tenantId);
  res.status(200).json({
    success: true,
    user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role },
    tenant: { id: tenant._id, name: tenant.name, slug: tenant.slug },
  });
});
module.exports = { register, login ,getMe};