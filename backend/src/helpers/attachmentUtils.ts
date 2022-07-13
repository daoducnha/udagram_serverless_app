import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

const s3_bucket = process.env.ATTACHMENT_S3_BUCKET
const AWS_REGION = process.env.AWS_REGION

export async function createPresignedUrl(attachmentId: string): Promise<string> {
    const s3 = new XAWS.S3({
        signatureVersion: 'v4'
    })

    const presignedUrl = s3.getSignedUrl('putObject', {
        Bucket: s3_bucket,
        Key: attachmentId,
        Expires: '60'  
    })

    return presignedUrl
}

export async function createAttachmentUrl(attachmentId: string): Promise<string>  {
    return `https://${s3_bucket}.s3.${AWS_REGION}.amazonaws.com/${attachmentId}`
}