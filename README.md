# sequelize-encrypted

Encrypted fields for Sequelize ORM

```js
var Sequelize = require('sequelize');
var EncryptedField = require('sequelize-encrypted');

// secret key should be 32 bytes hex encoded (64 characters)
var key = process.env.SECRET_KEY_HERE;

var enc_fields = EncryptedField(Sequelize, key);

var User = sequelize.define('user', {
    name: Sequelize.STRING,
    encrypted: enc_fields.vault('encrypted'),

    // encrypted virtual fields
    private_1: enc_fields.field('private_1'),

    // Optional second argument allows you
    // to pass in a validation configuration
    // as well as an optional return type
    private_2: enc_fields.field('private_2', {
      type: Sequelize.TEXT,
      validate: {
        isInt: true  
      },
      defaultValue: null
    })
})

var user = User.build();
user.private_1 = 'test';
```

## How it works

The `safe` returns a sequelize BLOB field configured with getters/setters for decrypting and encrypting data. Encrypted JSON encodes the value you set and then encrypts this value before storing in the database.

Additionally, there are `.field` methods which return sequelize VIRTUAL fields that provide access to specific fields in the encrypted vault. It is recommended that these are used to get/set values versus using the encrypted field directly.

When calling `.vault` or `.field` you must specify the field name. This cannot be auto-detected by the module.

## Generating a key

By default, AES-SHA256-CBC is used to encrypt data. You should generate a random key that is 32 bytes.

```
openssl rand -hex 32
```

Do not save this key with the source code, ideally you should use an environment variable or other configuration injection to provide the key during app startup.

## Tips

You might find it useful to override the default `toJSON` implementation for your model to omit the encrypted field or other sensitive fields.

## License

MIT
