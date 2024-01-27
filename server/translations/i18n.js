import i18next from 'i18next';

i18next.init({
  fallbackLng: 'en',
  resources: {
    en: {
      translation: {
        errorCredentials: 'Invalid Username or Password'
      }
    },
    hi: {
      translation: {
        errorCredentials: 'अमान्य उपयोगकर्ता नाम या पासवर्ड'
      }
    },
    be: {
      translation: {
        errorCredentials: 'অবৈধ ব্যবহারকারীর নাম বা পাসওয়ার্ড'
      }
    },
    de: {
      translation: {
        errorCredentials: 'Ungültiger Benutzername oder Passwort'
      }
    },

    es: {
      translation: {
        errorCredentials: 'Nombre de usuario o contraseña no válidos'
      }
    },
    fr: {
      translation: {
        errorCredentials: 'Nom d utilisateur ou mot de passe incorrect'
      }
    },
    it: {
      translation: {
        errorCredentials: 'Nome utente o password non validi'
      }
    },
    ja: {
      translation: {
        errorCredentials: '無効なユーザー名またはパスワード'
      }
    },
    ko: {
      translation: {
        errorCredentials: '잘못된 사용자 이름 또는 비밀번호'
      }
    },
    pt: {
      translation: {
        errorCredentials: 'Nome de usuário ou senha inválidos'
      }
    },
    sv: {
      translation: {
        errorCredentials: 'Ogiltigt användarnamn eller lösenord'
      }
    },
    uk: {
      translation: {
        errorCredentials: 'Невірне ім я користувача або пароль'
      }
    },
    zh: {
      translation: {
        errorCredentials: '无效的用户名或密码'
      }
    },
    tr: {
      translation: {
        errorCredentials: 'Geçersiz kullanıcı adı veya şifre'
      }
    }
  }
});

module.exports = i18next;
