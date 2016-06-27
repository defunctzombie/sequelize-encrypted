import assert from 'assert';
import Sequelize from 'sequelize';
import EncryptedField from '../';

const sequelize = new Sequelize('postgres://postgres@db:5432/postgres');

const key1 = 'a593e7f567d01031d153b5af6d9a25766b95926cff91c6be3438c7f7ac37230e';
const key2 = 'a593e7f567d01031d153b5af6d9a25766b95926cff91c6be3438c7f7ac37230f';

const v1 = EncryptedField(Sequelize, key1);
const v2 = EncryptedField(Sequelize, key2);

describe('sequelize-encrypted', () => {

    const User = sequelize.define('user', {
        name: Sequelize.STRING,
        encrypted: v1.vault('encrypted'),
        another_encrypted: v2.vault('another_encrypted'),

        // encrypted virtual fields
        private_1: v1.field('private_1'),
        private_2: v2.field('private_2'),
    });

    before('create models', async () => {
        await User.sync({force: true});
    });

    it('should save an encrypted field', async () => {
        const user = User.build();
        user.private_1 = 'test';

        await user.save();
        const found = await User.findById(user.id);
        assert.equal(found.private_1, user.private_1);
    });

    it('should support multiple encrypted fields', async() => {
        const user = User.build();
        user.private_1 = 'baz';
        user.private_2 = 'foobar';
        await user.save();

        const vault = EncryptedField(Sequelize, key2);

        const AnotherUser = sequelize.define('user', {
            name: Sequelize.STRING,
            another_encrypted: vault.vault('another_encrypted'),
            private_2: vault.field('private_2'),
            private_1: vault.field('private_1'),
        });

        const found = await AnotherUser.findById(user.id);
        assert.equal(found.private_2, user.private_2);

        // encrypted with key1 and different field originally
        // and thus can't be recovered with key2
        assert.equal(found.private_1, undefined);
    });

});
