import aes from './aes-256-gcm';

const nacl = require('tweetnacl');
nacl.util = require('tweetnacl-util');

type EncryptAsymmetricProps = {
  plaintext: string;
  publicKey: string;
  privateKey: string;
};

/**
 * Return assymmetrically encrypted [plaintext] using [publicKey] where
 * [publicKey] likely belongs to the recipient.
 * @param {Object} obj
 * @param {String} obj.plaintext - plaintext to encrypt
 * @param {String} obj.publicKey - public key of the recipient
 * @param {String} obj.privateKey - private key of the sender (current user)
 * @returns {Object} obj
 * @returns {String} ciphertext - base64-encoded ciphertext
 * @returns {String} nonce - base64-encoded nonce
 */
const encryptAssymmetric = ({
  plaintext,
  publicKey,
  privateKey
}: EncryptAsymmetricProps): {
  ciphertext: string;
  nonce: string;
} => {
  const nonce = nacl.randomBytes(24);
  const ciphertext = nacl.box(
    nacl.util.decodeUTF8(plaintext),
    nonce,
    nacl.util.decodeBase64(publicKey),
    nacl.util.decodeBase64(privateKey)
  );

  return {
    ciphertext: nacl.util.encodeBase64(ciphertext),
    nonce: nacl.util.encodeBase64(nonce)
  };
};

type DecryptAsymmetricProps = {
  ciphertext: string;
  nonce: string;
  publicKey: string;
  privateKey: string;
};

/**
 * Return assymmetrically decrypted [ciphertext] using [privateKey] where
 * [privateKey] likely belongs to the recipient.
 * @param {Object} obj
 * @param {String} obj.ciphertext - ciphertext to decrypt
 * @param {String} obj.nonce - nonce
 * @param {String} obj.publicKey - base64-encoded public key of the sender
 * @param {String} obj.privateKey - base64-encoded private key of the receiver (current user)
 */
const decryptAssymmetric = ({
  ciphertext,
  nonce,
  publicKey,
  privateKey
}: DecryptAsymmetricProps): string => {
  const plaintext = nacl.box.open(
    nacl.util.decodeBase64(ciphertext),
    nacl.util.decodeBase64(nonce),
    nacl.util.decodeBase64(publicKey),
    nacl.util.decodeBase64(privateKey)
  );

  return nacl.util.encodeUTF8(plaintext);
};

type EncryptSymmetricProps = {
  plaintext: string;
  key: string;
};

type EncryptSymmetricReturn = {
  ciphertext: string;
  iv: string;
  tag: string;
};
/**
 * Return symmetrically encrypted [plaintext] using [key].
 */
const encryptSymmetric = ({ plaintext, key }: EncryptSymmetricProps): EncryptSymmetricReturn => {
  let ciphertext;
  let iv;
  let tag;
  try {
    const obj = aes.encrypt({ text: plaintext, secret: key });
    ciphertext = obj.ciphertext;
    iv = obj.iv;
    tag = obj.tag;
  } catch (err) {
    console.log('Failed to perform encryption');
    console.log(err);
    process.exit(1);
  }

  return {
    ciphertext,
    iv,
    tag
  };
};

type DecryptSymmetricProps = {
  ciphertext: string;
  iv: string;
  tag: string;
  key: string;
};

/**
 * Return symmetrically decypted [ciphertext] using [iv], [tag],
 * and [key].
 * @param {Object} obj
 * @param {String} obj.ciphertext - ciphertext to decrypt
 * @param {String} obj.iv - iv
 * @param {String} obj.tag - tag
 * @param {String} obj.key - 32-byte hex key
 *
 */
const decryptSymmetric = ({ ciphertext, iv, tag, key }: DecryptSymmetricProps): string => {
  let plaintext;
  try {
    plaintext = aes.decrypt({ ciphertext, iv, tag, secret: key });
  } catch (err) {
    console.log('Failed to perform decryption');
    process.exit(1);
  }

  return plaintext;
};

export { decryptAssymmetric, decryptSymmetric, encryptAssymmetric, encryptSymmetric };
