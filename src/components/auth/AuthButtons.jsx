import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/clerk-react'
import './AuthButtons.css'

const translations = {
  ar: {
    signIn: 'تسجيل الدخول',
    signUp: 'إنشاء حساب',
    welcome: 'مرحباً'
  },
  en: {
    signIn: 'Sign In',
    signUp: 'Sign Up',
    welcome: 'Welcome'
  }
}

export default function AuthButtons({ lang = 'ar' }) {
  const { isSignedIn, user, isLoaded } = useUser()
  const t = translations[lang] || translations.ar

  if (!isLoaded) {
    return <div className="auth-loading"></div>
  }

  if (isSignedIn) {
    return (
      <div className="auth-user">
        <span className="welcome-text">
          {t.welcome}, {user.firstName || user.username}
        </span>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: 'user-avatar'
            }
          }}
        />
      </div>
    )
  }

  return (
    <div className="auth-buttons">
      <SignInButton mode="modal">
        <button className="btn btn-outline-auth">{t.signIn}</button>
      </SignInButton>
      <SignUpButton mode="modal">
        <button className="btn btn-primary-auth">{t.signUp}</button>
      </SignUpButton>
    </div>
  )
}
