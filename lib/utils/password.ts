// lib/utils/password.ts

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  score: number;
  label: 'Weak' | 'Medium' | 'Strong' | 'Very Strong';
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  
  // Track which requirements are met
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  // Build errors list
  if (!checks.length) {
    errors.push('Password must be at least 8 characters');
  }
  if (!checks.uppercase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!checks.lowercase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!checks.number) {
    errors.push('Password must contain at least one number');
  }
  if (!checks.special) {
    errors.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
  }

  // Count how many requirements are met
  const requirementsMet = Object.values(checks).filter(Boolean).length;

  // ✅ STRICT LABELING - A password is ONLY "Strong" if ALL requirements are met
  let label: 'Weak' | 'Medium' | 'Strong' | 'Very Strong';
  
  // ✅ ALL requirements must be met for "Strong" or "Very Strong"
  if (requirementsMet === 5) {
    // All requirements met
    if (password.length >= 16) {
      label = 'Very Strong';
    } else {
      label = 'Strong';
    }
  } else {
    // ✅ ANY missing requirement = NOT Strong
    label = 'Medium';
  }

  // ✅ Check if password is too weak (less than 3 requirements met)
  if (requirementsMet <= 2) {
    label = 'Weak';
  }

  // ✅ Penalty for common patterns
  if (password.length > 0) {
    const commonPasswords = [
      'password', 'password123', '12345678', 'qwerty', 'abc123',
      'admin', 'welcome', 'letmein', 'passw0rd', 'admin123',
      'qwerty123', 'password1', '123456789', 'abcdef'
    ];
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common. Please choose a more unique password');
      label = 'Weak';
    }
  }

  // ✅ Check for repeated characters (e.g., "aaa", "111")
  if (/(.)\1{3,}/.test(password) && password.length > 0) {
    if (!errors.includes('Password contains repeated characters')) {
      errors.push('Password contains repeated characters');
    }
    if (label === 'Strong' || label === 'Very Strong') {
      label = 'Medium';
    }
  }

  // ✅ Check for sequential characters (e.g., "abc", "123")
  if (/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789/i.test(password)) {
    if (!errors.includes('Password contains sequential characters')) {
      errors.push('Password contains sequential characters');
    }
    if (label === 'Strong' || label === 'Very Strong') {
      label = 'Medium';
    }
  }

  // Calculate score
  let score = requirementsMet;
  
  // Bonus for length > 14 (only if all requirements met)
  if (password.length > 14 && requirementsMet === 5) {
    score += 1;
  }

  // Penalty for repeated characters
  if (/(.)\1{3,}/.test(password)) {
    score = Math.max(0, score - 0.5);
  }

  const finalScore = Math.min(Math.max(Math.round(score), 0), 6);

  return {
    isValid: errors.length === 0,
    errors,
    score: finalScore,
    label,
  };
}

export function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'bg-red-500';
    case 2:
      return 'bg-orange-500';
    case 3:
      return 'bg-yellow-500';
    case 4:
      return 'bg-green-500';
    case 5:
    case 6:
      return 'bg-emerald-500';
    default:
      return 'bg-gray-300';
  }
}

export function getPasswordStrengthLabel(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'Weak';
    case 2:
      return 'Fair';
    case 3:
      return 'Medium';
    case 4:
      return 'Strong';
    case 5:
    case 6:
      return 'Very Strong';
    default:
      return 'Enter password';
  }
}

export function generateStrongPassword(): string {
  const length = 16;
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*(),.?":{}|<>';
  
  const allChars = uppercase + lowercase + numbers + special;
  
  // Ensure at least one of each type
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill remaining length with random characters
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}