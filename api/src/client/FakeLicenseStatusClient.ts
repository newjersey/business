import AWS from "aws-sdk";
import { LicenseEntity, LicenseStatusClient } from "../domain/types";

export const FakeLicenseStatusClient = (): LicenseStatusClient => {
  const search = async (): Promise<LicenseEntity[]> => {
    const S3 = new AWS.S3();
    await S3.getObject();
    const data = await S3.getObject({
      Bucket: "data-fixtures",
      Key: "license-status-response.json",
    }).promise();

    if (!data.Body) {
      return Promise.reject();
    }
    return JSON.parse(data.Body.toString("utf-8")) as LicenseEntity[];
  };

  return {
    search,
  };
};
