import crypto from 'crypto';
import { transport } from '../config/mail.js';
import { User } from '../models/User.js';

export async function sendVerificationEmail(userId: string, emailToVerify: string) {
  
  // 1. Generate a secure 6-digit OTP
  // crypto.randomInt is cryptographically secure
  const otp = crypto.randomInt(100000, 999999);
  const otpString = otp.toString();

  // 2. Calculate expiration time (10 minutes from now)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins in ms

  // 3. Find user and update OTP fields
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        authOTP: otp,
        authOTPExpiresAt: expiresAt,
        schoolEmail: emailToVerify, // Store the email being verified
        verifiedEmail: false, // Reset verification status
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    // 4. Configure the email content
    const mailOptions = {
      from: '"Makethecut" <no-reply@makethecut.ca>',
      to: emailToVerify, // Send to the NEW email they want to link
      subject: 'Verify your new email address',
      text: `Your verification code is ${otpString}. It expires in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Verify your new email</h2>
              <p>You requested to link <b>${emailToVerify}</b> to your account.</p>
          <p>Use the code below to complete the process:</p>
          <h1 style="color: #4CAF50; letter-spacing: 5px;">${otpString}</h1>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
    };

    // 5. Send the email
    await transport.sendMail(mailOptions);
    console.log(`OTP sent to ${emailToVerify} for user ${userId}`);
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function verifyOTP(userId: string, emailToVerify: string, otp: string) {
  try {
    // 1. Find the user and verify they exist
    const user = await User.findById(userId);

    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    // 2. Check if OTP exists
    if (!user.authOTP || !user.authOTPExpiresAt) {
      return { success: false, message: 'No OTP found. Please request a new verification code.' };
    }

    // 3. Check for expiration
    if (new Date() > user.authOTPExpiresAt) {
      // Cleanup expired OTP
      await User.findByIdAndUpdate(userId, {
        authOTP: undefined,
        authOTPExpiresAt: undefined,
        updatedAt: new Date()
      });
      return { success: false, message: 'OTP has expired. Please request a new one.' };
    }

    // 4. Check if email matches the one being verified
    if (user.schoolEmail !== emailToVerify) {
      return { success: false, message: 'Email mismatch. Please use the email address that received the OTP.' };
    }

    // 5. Check if OTP matches (convert string to number for comparison)
    const otpNumber = parseInt(otp, 10);
    if (user.authOTP !== otpNumber) {
      return { success: false, message: 'Incorrect OTP.' };
    }

    // 6. SUCCESS: Update user to mark email as verified and clear OTP
    await User.findByIdAndUpdate(
      userId,
      {
        verifiedEmail: true,
        authOTP: undefined, // Clear OTP to prevent reuse
        authOTPExpiresAt: undefined, // Clear expiration
        updatedAt: new Date()
      }
    );

    return { success: true, message: 'Email verified and linked successfully!' };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { success: false, message: 'An error occurred while verifying the OTP.' };
  }
}