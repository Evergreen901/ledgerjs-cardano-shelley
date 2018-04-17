import { expect } from "chai";
import Int64 from "node-int64";

import { getAda } from "../utils";

describe("testCBORDecode", async () => {
  let ada = {};

  beforeEach(async () => {
    ada = await getAda();
  });

  afterEach(async () => {
    await ada.t.close();
  });

  it("Should decode CBOR with 1 transaction", async () => {
    const tx = "839F8200D8185826825820E981442C2BE40475BB42193CA35907861D90715854DE6FCBA767B98F1789B51219439AFF9F8282D818584A83581CE7FE8E468D2249F18CD7BF9AEC0D4374B7D3E18609EDE8589F82F7F0A20058208200581C240596B9B63FC010C06FBE92CF6F820587406534795958C411E662DC014443C0688E001A6768CC861B0037699E3EA6D064FFA0";

    const response = await ada.testCBORDecode(tx);

    const amount = new Int64(15597252095955044);
    expect(response.inputs).to.equal(1);
    expect(response.outputs).to.equal(1);
    expect(response.txs[0].amount).to.equal(amount.toOctetString());
  });

  it("Should decode CBOR with 2 transactions", async () => {
    const tx = "839f8200d81858268258204806bbdfa6bbbfea0443ab6c301f6d7d04442f0a146877f654c08da092af3dd8193c508200d818582682582060fc8fbdd6ff6c3b455d8a5b9f86d33f4137c45ece43abb86e04671254e12c08197a8bff9f8282d818585583581ce6e37d78f4326709af13851862e075bce800d06401ad5c370d4d48e8a20058208200581c23f1de5619369c763e19835e0cb62c255c3fca80aa13057a1760e804014f4e4ced4aa010522e84b8e70a121894001ae41ef3231b000000d16b11cb538282d818585f83581cfd9104b3efb4c7425d697eeb3efc723ef4ff469e7f37f41a5aff78a9a20058208200581c53345e24a7a30ec701611c7e9d0593c41d6ea335b2eb195c9a0d2238015818578b485adc9d142b1e692de1fd5929acfc5a31332938f192011ad0fcdc751b002aa1f087327872ffa0";

    const response = await ada.testCBORDecode(tx);

    const tx0Amount = new Int64(899444493139);
    const tx1Amount = new Int64(12000003454302322);

    expect(response.inputs).to.equal(2);
    expect(response.outputs).to.equal(2);
    expect(response.txs[0].amount).to.equal(tx0Amount.toOctetString());
    expect(response.txs[1].amount).to.equal(tx1Amount.toOctetString());
  });

  it("Should allow a transaction sending 18446744073709552000 lovelaces (64bit unsigned limit)", async () => {
    const tx = "839F8200D8185826825820E981442C2BE40475BB42193CA35907861D90715854DE6FCBA767B98F1789B51219439AFF9F8282D818584A83581CE7FE8E468D2249F18CD7BF9AEC0D4374B7D3E18609EDE8589F82F7F0A20058208200581C240596B9B63FC010C06FBE92CF6F820587406534795958C411E662DC014443C0688E001A6768CC861BFFFFFFFFFFFFFFFFA0";

    const response = await ada.testCBORDecode(tx);
    // We of course can"t write 18446744073709552000 here, as it
    // exceeds Number.MAX_SAFE_INTEGER (that's why were using Int64).
    // Instead, we use high and low bytes to correctly produce the set of octets.
    const amount = new Int64(0xffffffff, 0xfffffffff);

    expect(response.inputs).to.equal(1);
    expect(response.outputs).to.equal(1);
    expect(response.txs[0].amount).to.equal(amount.toOctetString());
  });

  it("Should allow a transaction sending 0 lovelaces", async () => {
    const tx = "839F8200D8185826825820E981442C2BE40475BB42193CA35907861D90715854DE6FCBA767B98F1789B51219439AFF9F8282D818584A83581CE7FE8E468D2249F18CD7BF9AEC0D4374B7D3E18609EDE8589F82F7F0A20058208200581C240596B9B63FC010C06FBE92CF6F820587406534795958C411E662DC014443C0688E001A6768CC861B0000000000000000A0";

    const response = await ada.testCBORDecode(tx);
    const amount = new Int64(0);

    expect(response.inputs).to.equal(1);
    expect(response.outputs).to.equal(1);
    expect(response.txs[0].amount).to.equal(amount.toOctetString());
  });

  it("Should reject a transaction with invalid input", async () => {
    const tx = "839F8200D8180026820020E981442C2BE40475BB42193CA35907861D90715854DE6FCBA767B98F1789B51219439AFF9F8282D818584A83581CE7FE8E468D2249F18CD7BF9AEC0D4374B7D3E18609EDE8589F82F7F0A20058208200581C240596B9B63FC010C06FBE92CF6F820587406534795958C411E662DC014443C0688E001A6768CC861B0037699E3EA6D064FFA0";

    try {
      const response = await ada.testCBORDecode(tx);
      throw new Error("Expected error");
    } catch (error) {
      expect(error.message).to.have.string("5901");
    }
  });

  it("Should reject a transaction with no inputs", async () => {
    const tx = "8381810082828283581CE6E37D78F4326709AF13851862E075BCE800D06401AD5C370D4D48E8A20058208200581C23F1DE5619369C763E19835E0CB62C255C3FCA80AA13057A1760E804014F4E4CED4AA010522E84B8E70A121894001AE41EF3231B0075FAE341E48715828283581CFD9104B3EFB4C7425D697EEB3EFC723EF4FF469E7F37F41A5AFF78A9A20058208200581C53345E24A7A30EC701611C7E9D0593C41D6EA335B2EB195C9A0D2238015818578B485ADC9D142B1E692DE1FD5929ACFC5A31332938F192011AD0FCDC751B0003D8257C6B4DB7A0";

    try {
      const response = await ada.testCBORDecode(tx);
      throw new Error("Expected error");
    } catch (error) {
      expect(error.message).to.have.string("5902");
    }
  });

  it("Should reject a transaction sending over 64bit integer limit", async () => {
    const tx = "839F8200D8185826825820E981442C2BE40475BB42193CA35907861D90715854DE6FCBA767B98F1789B51219439AFF9F8282D818584A83581CE7FE8E468D2249F18CD7BF9AEC0D4374B7D3E18609EDE8589F82F7F0A20058208200581C240596B9B63FC010C06FBE92CF6F820587406534795958C411E662DC014443C0688E001A6768CC861BFFFFFFFFFFFFFFFF01A0";

    try {
      const response = await ada.testCBORDecode(tx);
      throw new Error("Expected error");
    } catch (error) {
      expect(error.message).to.have.string("5903");
    }
  });

  it("Should reject a transaction with no outputs", async () => {
    const tx = "839f8200d818582682582060fc8fbdd6ff6c3b455d8a5b9f86d33f4137c45ece43abb86e04671254e12c08197a8bff9fffa0";

    try {
      const response = await ada.testCBORDecode(tx);
      throw new Error("Expected error");
    } catch (error) {
      expect(error.message).to.have.string("5904");
    }
  });

  it("Should reject a transaction with inputs > 6", async () => {
    const tx = "839f8200d818582682582060fc8fbdd6ff6c3b455d8a5b9f86d33f4137c45ece43abb86e04671254e12c08197a8b8200d818582682582060fc8fbdd6ff6c3b455d8a5b9f86d33f4137c45ece43abb86e04671254e12c08197a8b8200d818582682582060fc8fbdd6ff6c3b455d8a5b9f86d33f4137c45ece43abb86e04671254e12c08197a8b8200d818582682582060fc8fbdd6ff6c3b455d8a5b9f86d33f4137c45ece43abb86e04671254e12c08197a8b8200d818582682582060fc8fbdd6ff6c3b455d8a5b9f86d33f4137c45ece43abb86e04671254e12c08197a8b8200d818582682582060fc8fbdd6ff6c3b455d8a5b9f86d33f4137c45ece43abb86e04671254e12c08197a8b8200d818582682582060fc8fbdd6ff6c3b455d8a5b9f86d33f4137c45ece43abb86e04671254e12c08197a8bff9f8282d818585583581ce6e37d78f4326709af13851862e075bce800d06401ad5c370d4d48e8a20058208200581c23f1de5619369c763e19835e0cb62c255c3fca80aa13057a1760e804014f4e4ced4aa010522e84b8e70a121894001ae41ef3231b0075fae341e487158282d818585583581ce6e37d78f4326709af13851862e075bce800d06401ad5c370d4d48e8a20058208200581c23f1de5619369c763e19835e0cb62c255c3fca80aa13057a1760e804014f4e4ced4aa010522e84b8e70a121894001ae41ef3231b0075fae341e487158282d818585583581ce6e37d78f4326709af13851862e075bce800d06401ad5c370d4d48e8a20058208200581c23f1de5619369c763e19835e0cb62c255c3fca80aa13057a1760e804014f4e4ced4aa010522e84b8e70a121894001ae41ef3231b0075fae341e487158282d818585583581ce6e37d78f4326709af13851862e075bce800d06401ad5c370d4d48e8a20058208200581c23f1de5619369c763e19835e0cb62c255c3fca80aa13057a1760e804014f4e4ced4aa010522e84b8e70a121894001ae41ef3231b0075fae341e487158282d818585583581ce6e37d78f4326709af13851862e075bce800d06401ad5c370d4d48e8a20058208200581c23f1de5619369c763e19835e0cb62c255c3fca80aa13057a1760e804014f4e4ced4aa010522e84b8e70a121894001ae41ef3231b0075fae341e487158282d818585583581ce6e37d78f4326709af13851862e075bce800d06401ad5c370d4d48e8a20058208200581c23f1de5619369c763e19835e0cb62c255c3fca80aa13057a1760e804014f4e4ced4aa010522e84b8e70a121894001ae41ef3231b0075fae341e48715ffa0";

    try {
      const response = await ada.testCBORDecode(tx);
      throw new Error("Expected error");
    } catch (error) {
      expect(error.message).to.have.string("5905");
    }
  });

  it("Should reject a transaction with outputs > 6", async () => {
    const tx = "839f8200d818582682582060fc8fbdd6ff6c3b455d8a5b9f86d33f4137c45ece43abb86e04671254e12c08197a8b8200d818582682582060fc8fbdd6ff6c3b455d8a5b9f86d33f4137c45ece43abb86e04671254e12c08197a8b8200d818582682582060fc8fbdd6ff6c3b455d8a5b9f86d33f4137c45ece43abb86e04671254e12c08197a8b8200d818582682582060fc8fbdd6ff6c3b455d8a5b9f86d33f4137c45ece43abb86e04671254e12c08197a8b8200d818582682582060fc8fbdd6ff6c3b455d8a5b9f86d33f4137c45ece43abb86e04671254e12c08197a8b8200d818582682582060fc8fbdd6ff6c3b455d8a5b9f86d33f4137c45ece43abb86e04671254e12c08197a8bff9f8282d818585583581ce6e37d78f4326709af13851862e075bce800d06401ad5c370d4d48e8a20058208200581c23f1de5619369c763e19835e0cb62c255c3fca80aa13057a1760e804014f4e4ced4aa010522e84b8e70a121894001ae41ef3231b0075fae341e487158282d818585583581ce6e37d78f4326709af13851862e075bce800d06401ad5c370d4d48e8a20058208200581c23f1de5619369c763e19835e0cb62c255c3fca80aa13057a1760e804014f4e4ced4aa010522e84b8e70a121894001ae41ef3231b0075fae341e487158282d818585583581ce6e37d78f4326709af13851862e075bce800d06401ad5c370d4d48e8a20058208200581c23f1de5619369c763e19835e0cb62c255c3fca80aa13057a1760e804014f4e4ced4aa010522e84b8e70a121894001ae41ef3231b0075fae341e487158282d818585583581ce6e37d78f4326709af13851862e075bce800d06401ad5c370d4d48e8a20058208200581c23f1de5619369c763e19835e0cb62c255c3fca80aa13057a1760e804014f4e4ced4aa010522e84b8e70a121894001ae41ef3231b0075fae341e487158282d818585583581ce6e37d78f4326709af13851862e075bce800d06401ad5c370d4d48e8a20058208200581c23f1de5619369c763e19835e0cb62c255c3fca80aa13057a1760e804014f4e4ced4aa010522e84b8e70a121894001ae41ef3231b0075fae341e487158282d818585583581ce6e37d78f4326709af13851862e075bce800d06401ad5c370d4d48e8a20058208200581c23f1de5619369c763e19835e0cb62c255c3fca80aa13057a1760e804014f4e4ced4aa010522e84b8e70a121894001ae41ef3231b0075fae341e487158282d818585583581ce6e37d78f4326709af13851862e075bce800d06401ad5c370d4d48e8a20058208200581c23f1de5619369c763e19835e0cb62c255c3fca80aa13057a1760e804014f4e4ced4aa010522e84b8e70a121894001ae41ef3231b0075fae341e48715ffa0";

    try {
      const response = await ada.testCBORDecode(tx);
      throw new Error("Expected error");
    } catch (error) {
      expect(error.message).to.have.string("5906");
    }
  });

  it("Should reject a transaction > 1024 bytes", async () => {
    const tx = "839f8200d81858268258204806bbdfa6bbbfea0443ab6c301f6d7d04442f0a146877f654c08da092af3dd8193c508200d818582682582060fc8fbdd6ff6c3b455d8a5b9f86d33f4137c45ece43abb86e04671254e12c08197a8bff9f8282d818585583581ce6e37d78f4326709af13851862e075bce800d06401ad5c370d4d48e8a20058208200581c23f1de5619369c763e19835e0cb62c255c3fca80aa13057a1760e804014f4e4ced4aa010522e84b8e70a121894001ae41ef3231b0075fae341e487158282d818585f83581cfd9104b3efb4c7425d697eeb3efc723ef4ff469e7f37f41a5aff78a9a20058208200581c53345e24a7a30ec701611c7e9d0593c41d6ea335b2eb195c9a0d2238015818578b485adc9d142b1e692de1fd5929acfc5a31332938f192011ad0fcdc751b0003d8257c6b4db7ffa0839f8200d81858268258204806bbdfa6bbbfea0443ab6c301f6d7d04442f0a146877f654c08da092af3dd8193c508200d818582682582060fc8fbdd6ff6c3b455d8a5b9f86d33f4137c45ece43abb86e04671254e12c08197a8bff9f8282d818585583581ce6e37d78f4326709af13851862e075bce800d06401ad5c370d4d48e8a20058208200581c23f1de5619369c763e19835e0cb62c255c3fca80aa13057a1760e804014f4e4ced4aa010522e84b8e70a121894001ae41ef3231b0075fae341e487158282d818585f83581cfd9104b3efb4c7425d697eeb3efc723ef4ff469e7f37f41a5aff78a9a20058208200581c53345e24a7a30ec701611c7e9d0593c41d6ea335b2eb195c9a0d2238015818578b485adc9d142b1e692de1fd5929acfc5a31332938f192011ad0fcdc751b0003d8257c6b4db7ffa0839f8200d81858268258204806bbdfa6bbbfea0443ab6c301f6d7d04442f0a146877f654c08da092af3dd8193c508200d818582682582060fc8fbdd6ff6c3b455d8a5b9f86d33f4137c45ece43abb86e04671254e12c08197a8bff9f8282d818585583581ce6e37d78f4326709af13851862e075bce800d06401ad5c370d4d48e8a20058208200581c23f1de5619369c763e19835e0cb62c255c3fca80aa13057a1760e804014f4e4ced4aa010522e84b8e70a121894001ae41ef3231b0075fae341e487158282d818585f83581cfd9104b3efb4c7425d697eeb3efc723ef4ff469e7f37f41a5aff78a9a20058208200581c53345e24a7a30ec701611c7e9d0593c41d6ea335b2eb195c9a0d2238015818578b485adc9d142b1e692de1fd5929acfc5a31332938f192011ad0fcdc751b0003d8257c6b4db7ffa0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a00a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a";

    try {
      const response = await ada.testCBORDecode(tx);
      throw new Error("Expected error");
    } catch (error) {
      expect(error.message).to.have.string("5001");
    }
  });

  it("Should reject a blank input", async () => {
    try {
      const response = await ada.testCBORDecode();
      throw new Error("Expected error");
    } catch (error) {
      // we're cool
    }
  });

  it("Should return empty for empty string", async () => {
    const response = await ada.testCBORDecode("");
    expect(response).not.to.have.property('txs');
  });

  it("Should decode CBOR 20 times", (done) => {
    const tx = "839F8200D8185826825820E981442C2BE40475BB42193CA35907861D90715854DE6FCBA767B98F1789B51219439AFF9F8282D818584A83581CE7FE8E468D2249F18CD7BF9AEC0D4374B7D3E18609EDE8589F82F7F0A20058208200581C240596B9B63FC010C06FBE92CF6F820587406534795958C411E662DC014443C0688E001A6768CC861B0037699E3EA6D064FFA0";

    const check = (res) => {
      const amount = new Int64(15597252095955044);
      expect(res.inputs).to.equal(1);
      expect(res.outputs).to.equal(1);
      expect(res.txs[0].amount).to.equal(amount.toOctetString());

      return ada.testCBORDecode(tx);
    };

    ada.testCBORDecode(tx)
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => check(res))
      .then(res => done())
      .catch(error => done(error));
  });
});