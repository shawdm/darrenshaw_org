<?php
/**
 * The base configurations of the WordPress.
 *
 * This file has the following configurations: MySQL settings, Table Prefix,
 * Secret Keys, and ABSPATH. You can find more information by visiting
 * {@link http://codex.wordpress.org/Editing_wp-config.php Editing wp-config.php}
 * Codex page. You can get the MySQL settings from your web host.
 *
 * This file is used by the wp-config.php creation script during the
 * installation. You don't have to use the web site, you can just copy this file
 * to "wp-config.php" and fill in the values.
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME', 'eightbar_co_uk');

/** MySQL database username */
define('DB_USER', 'root');

/** MySQL database password */
define('DB_PASSWORD', 'root');

/** MySQL hostname */
define('DB_HOST', 'localhost');

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         '5L/{}8Jb/uqJj:j)btm~U={E<Jj@y,bVGzn[] d|)|uy|jK)9pqH)7?hAO|nV nF');
define('SECURE_AUTH_KEY',  'KmI+F,7~Lh!U7B({0APPv$MBnnob2[U2<^{!$:S!=?pd!1@RJF($ZB~jtGGY1NhQ');
define('LOGGED_IN_KEY',    'YH65%A%-}e#tM#aI|n])h*yi> Hc#>%|K*[3tPehBg^}T(dY{&Gyi8DBwmJSCqO6');
define('NONCE_KEY',        'Kg*M|px;{!m$GR:u|BZrb/PRR1VH^l8[qmqk}8RXxP_<cymm-p+`?8#h+S2N Z@i');
define('AUTH_SALT',        'Zt$Z2ki~RE9#s82=Q@l4KZO,;{V(EeQ>No0NXLQ&@f!58=5L 0M!]}mtcr] +!FX');
define('SECURE_AUTH_SALT', 'nlkmB}#fAiqH6;].a=<{(+pMOi-6|Sk~;olipUB16@-0,w]=YoxWJ=UDP0>u%_V*');
define('LOGGED_IN_SALT',   ':nW!M7#@$f!?$VGoY-v}C#SU6>uZ{2P&vuG&WOmTP,%MI^4(%VV[iA#}s-bR2$t.');
define('NONCE_SALT',       'qJm#i:Z}EpUXdd,!G|@dIYshy/W#j?5letOg1yK-sgIh19*EGfv~O;;rc;?-AxK:');

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each a unique
 * prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 */
define('WP_DEBUG', false);

/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');
