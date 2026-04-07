# Localization

Support for 48 languages with localized error messages for internationalized applications and global audiences.

## Capabilities

### Locale Functions

Zod provides localized error messages for 48 languages accessed through the `z.locales` namespace.

```typescript { .api }
/**
 * Locale error message functions
 * Each function returns an error map for the specific language
 */
namespace locales {
  function en(): ZodErrorMap;      // English
  function ar(): ZodErrorMap;      // Arabic
  function az(): ZodErrorMap;      // Azerbaijani
  function be(): ZodErrorMap;      // Belarusian
  function bg(): ZodErrorMap;      // Bulgarian
  function ca(): ZodErrorMap;      // Catalan
  function cs(): ZodErrorMap;      // Czech
  function da(): ZodErrorMap;      // Danish
  function de(): ZodErrorMap;      // German
  function eo(): ZodErrorMap;      // Esperanto
  function es(): ZodErrorMap;      // Spanish
  function fa(): ZodErrorMap;      // Persian
  function fi(): ZodErrorMap;      // Finnish
  function fr(): ZodErrorMap;      // French
  function frCA(): ZodErrorMap;    // French Canadian
  function he(): ZodErrorMap;      // Hebrew
  function hu(): ZodErrorMap;      // Hungarian
  function hy(): ZodErrorMap;      // Armenian
  function id(): ZodErrorMap;      // Indonesian
  function is(): ZodErrorMap;      // Icelandic
  function it(): ZodErrorMap;      // Italian
  function ja(): ZodErrorMap;      // Japanese
  function ka(): ZodErrorMap;      // Georgian
  function kh(): ZodErrorMap;      // Khmer
  function km(): ZodErrorMap;      // Khmer (alias)
  function ko(): ZodErrorMap;      // Korean
  function lt(): ZodErrorMap;      // Lithuanian
  function mk(): ZodErrorMap;      // Macedonian
  function ms(): ZodErrorMap;      // Malay
  function nl(): ZodErrorMap;      // Dutch
  function no(): ZodErrorMap;      // Norwegian
  function ota(): ZodErrorMap;     // Ottoman Turkish
  function ps(): ZodErrorMap;      // Pashto
  function pl(): ZodErrorMap;      // Polish
  function pt(): ZodErrorMap;      // Portuguese
  function ru(): ZodErrorMap;      // Russian
  function sl(): ZodErrorMap;      // Slovenian
  function sv(): ZodErrorMap;      // Swedish
  function ta(): ZodErrorMap;      // Tamil
  function th(): ZodErrorMap;      // Thai
  function tr(): ZodErrorMap;      // Turkish
  function ua(): ZodErrorMap;      // Ukrainian (alias)
  function uk(): ZodErrorMap;      // Ukrainian
  function ur(): ZodErrorMap;      // Urdu
  function uz(): ZodErrorMap;      // Uzbek
  function vi(): ZodErrorMap;      // Vietnamese
  function yo(): ZodErrorMap;      // Yoruba
  function zhCN(): ZodErrorMap;    // Chinese Simplified
  function zhTW(): ZodErrorMap;    // Chinese Traditional
}

type ZodErrorMap = (
  issue: ZodIssueOptionalMessage,
  ctx: ErrorMapCtx
) => { message: string };

interface ErrorMapCtx {
  defaultError: string;
  data: any;
}

type ZodIssueOptionalMessage = Omit<ZodIssue, 'message'> & { message?: string };
```

## Usage

### Setting Global Locale

Configure Zod to use a specific locale for all error messages globally.

```typescript
import * as z from 'zod';

// Set Spanish error messages globally
z.config({
  localeError: z.locales.es(),
});

// Now all validation errors will be in Spanish
const UserSchema = z.object({
  nombre: z.string().min(3),
  edad: z.number().min(18),
});

try {
  UserSchema.parse({ nombre: 'AB', edad: 15 });
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log(error.issues[0].message);
    // Error message in Spanish
  }
}

// Set Japanese error messages
z.config({
  localeError: z.locales.ja(),
});

// Set German error messages
z.config({
  localeError: z.locales.de(),
});

// Set French error messages
z.config({
  localeError: z.locales.fr(),
});

// Set Chinese Simplified error messages
z.config({
  localeError: z.locales.zhCN(),
});
```

### Per-Schema Locale

Use different locales for specific schemas without affecting global settings.

```typescript
import * as z from 'zod';

// Schema with Spanish errors
const SpanishSchema = z.string().min(3, {
  errorMap: z.locales.es(),
});

// Schema with French errors
const FrenchSchema = z.number().min(18, {
  errorMap: z.locales.fr(),
});

// Schema with German errors
const GermanSchema = z.object({
  name: z.string(),
  age: z.number(),
}, {
  errorMap: z.locales.de(),
});
```

### Dynamic Locale Selection

Select locale based on user preferences or application settings.

```typescript
import * as z from 'zod';

function getUserLocale(): string {
  // Get from user settings, browser, or application config
  return navigator.language || 'en';
}

function getZodLocale(locale: string): ZodErrorMap {
  const localeMap: Record<string, () => ZodErrorMap> = {
    'en': z.locales.en,
    'es': z.locales.es,
    'fr': z.locales.fr,
    'de': z.locales.de,
    'ja': z.locales.ja,
    'zh-CN': z.locales.zhCN,
    'zh-TW': z.locales.zhTW,
    'pt': z.locales.pt,
    'ru': z.locales.ru,
    'ar': z.locales.ar,
    'ko': z.locales.ko,
    'it': z.locales.it,
    'nl': z.locales.nl,
    'pl': z.locales.pl,
    'tr': z.locales.tr,
    'vi': z.locales.vi,
    'th': z.locales.th,
    'sv': z.locales.sv,
    'no': z.locales.no,
    'da': z.locales.da,
    'fi': z.locales.fi,
    'cs': z.locales.cs,
    'hu': z.locales.hu,
    'ro': z.locales.ru, // fallback
    'uk': z.locales.uk,
    'he': z.locales.he,
    'id': z.locales.id,
    'ms': z.locales.ms,
    'fa': z.locales.fa,
    'ur': z.locales.ur,
  };

  const localeFunc = localeMap[locale] || localeMap['en'];
  return localeFunc();
}

// Configure based on user locale
const userLocale = getUserLocale();
z.config({
  localeError: getZodLocale(userLocale),
});
```

### Context-Specific Localization

Use different locales for different parts of your application.

```typescript
import * as z from 'zod';

// English for admin panel
const AdminSchema = z.object({
  username: z.string().min(3),
  role: z.enum(['admin', 'user']),
}, {
  errorMap: z.locales.en(),
});

// Spanish for customer-facing forms
const CustomerSchema = z.object({
  nombre: z.string().min(1),
  email: z.string().email(),
}, {
  errorMap: z.locales.es(),
});

// Multi-language form validation
function validateForm(data: unknown, locale: string) {
  const FormSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    age: z.number().min(18),
  }, {
    errorMap: getZodLocale(locale),
  });

  return FormSchema.safeParse(data);
}

function getZodLocale(locale: string): ZodErrorMap {
  // Implementation from previous example
  return z.locales.en();
}
```

### Mixing Custom and Localized Errors

Combine localized error messages with custom validation messages.

```typescript
import * as z from 'zod';

// Set global locale
z.config({
  localeError: z.locales.es(),
});

// Schema with mix of localized and custom messages
const UserSchema = z.object({
  // Uses localized error
  name: z.string().min(3),

  // Custom error message (overrides locale)
  email: z.string().email('Por favor ingrese un email válido'),

  // Uses localized error
  age: z.number().min(18),

  // Custom refinement with custom message
  password: z.string().refine(
    (val) => val.length >= 8 && /[A-Z]/.test(val),
    { message: 'La contraseña debe tener al menos 8 caracteres con mayúscula' }
  ),
});
```

### Server-Side Localization

Handle multiple languages on the server based on request headers or user settings.

```typescript
import * as z from 'zod';

// Express.js example
function createLocalizedValidator(locale: string) {
  return (schema: z.ZodTypeAny) => {
    // Clone schema with localized error map
    return schema.transform((data) => data, {
      errorMap: getZodLocale(locale),
    });
  };
}

function handleRequest(req: any, res: any) {
  const locale = req.headers['accept-language']?.split(',')[0] || 'en';

  const RequestSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
  }, {
    errorMap: getZodLocale(locale),
  });

  const result = RequestSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      errors: result.error.format(),
    });
  }

  return res.json({ success: true, data: result.data });
}

function getZodLocale(locale: string): ZodErrorMap {
  // Implementation from previous example
  return z.locales.en();
}
```

### Client-Side Localization

Handle locale changes in client-side applications.

```typescript
import * as z from 'zod';
import { useState, useEffect } from 'react';

function useLocalizedSchema<T extends z.ZodTypeAny>(
  schema: T,
  locale: string
): T {
  useEffect(() => {
    z.config({
      localeError: getZodLocale(locale),
    });
  }, [locale]);

  return schema;
}

// Usage in React component
function RegistrationForm() {
  const [locale, setLocale] = useState('en');

  const FormSchema = useLocalizedSchema(
    z.object({
      name: z.string().min(3),
      email: z.string().email(),
      age: z.number().min(18),
    }),
    locale
  );

  const handleSubmit = (data: unknown) => {
    const result = FormSchema.safeParse(data);

    if (!result.success) {
      // Errors will be in the selected locale
      console.error(result.error.format());
    }
  };

  return (
    <form>
      <select value={locale} onChange={(e) => setLocale(e.target.value)}>
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
        <option value="de">Deutsch</option>
        <option value="ja">日本語</option>
        <option value="zh-CN">简体中文</option>
      </select>
      {/* Form fields */}
    </form>
  );
}

function getZodLocale(locale: string): ZodErrorMap {
  // Implementation
  return z.locales.en();
}
```

### Available Languages

Complete list of supported languages and their locale codes:

```typescript
// European Languages
z.locales.en()    // English
z.locales.es()    // Spanish
z.locales.fr()    // French
z.locales.frCA()  // French Canadian
z.locales.de()    // German
z.locales.it()    // Italian
z.locales.pt()    // Portuguese
z.locales.ru()    // Russian
z.locales.uk()    // Ukrainian
z.locales.ua()    // Ukrainian (alias)
z.locales.pl()    // Polish
z.locales.nl()    // Dutch
z.locales.cs()    // Czech
z.locales.da()    // Danish
z.locales.no()    // Norwegian
z.locales.sv()    // Swedish
z.locales.fi()    // Finnish
z.locales.hu()    // Hungarian
z.locales.be()    // Belarusian
z.locales.bg()    // Bulgarian
z.locales.sl()    // Slovenian
z.locales.mk()    // Macedonian
z.locales.lt()    // Lithuanian
z.locales.ca()    // Catalan
z.locales.eo()    // Esperanto
z.locales.is()    // Icelandic

// Middle Eastern & Central Asian
z.locales.ar()    // Arabic
z.locales.he()    // Hebrew
z.locales.tr()    // Turkish
z.locales.ota()   // Ottoman Turkish
z.locales.fa()    // Persian
z.locales.ur()    // Urdu
z.locales.ps()    // Pashto
z.locales.uz()    // Uzbek
z.locales.az()    // Azerbaijani
z.locales.hy()    // Armenian
z.locales.ka()    // Georgian

// Asian Languages
z.locales.ja()    // Japanese
z.locales.ko()    // Korean
z.locales.zhCN()  // Chinese Simplified
z.locales.zhTW()  // Chinese Traditional
z.locales.th()    // Thai
z.locales.vi()    // Vietnamese
z.locales.id()    // Indonesian
z.locales.ms()    // Malay
z.locales.kh()    // Khmer
z.locales.km()    // Khmer (alias)
z.locales.ta()    // Tamil

// African Languages
z.locales.yo()    // Yoruba
```

## Types

```typescript { .api }
namespace locales {
  function en(): ZodErrorMap;
  function ar(): ZodErrorMap;
  function az(): ZodErrorMap;
  function be(): ZodErrorMap;
  function bg(): ZodErrorMap;
  function ca(): ZodErrorMap;
  function cs(): ZodErrorMap;
  function da(): ZodErrorMap;
  function de(): ZodErrorMap;
  function eo(): ZodErrorMap;
  function es(): ZodErrorMap;
  function fa(): ZodErrorMap;
  function fi(): ZodErrorMap;
  function fr(): ZodErrorMap;
  function frCA(): ZodErrorMap;
  function he(): ZodErrorMap;
  function hu(): ZodErrorMap;
  function hy(): ZodErrorMap;
  function id(): ZodErrorMap;
  function is(): ZodErrorMap;
  function it(): ZodErrorMap;
  function ja(): ZodErrorMap;
  function ka(): ZodErrorMap;
  function kh(): ZodErrorMap;
  function km(): ZodErrorMap;
  function ko(): ZodErrorMap;
  function lt(): ZodErrorMap;
  function mk(): ZodErrorMap;
  function ms(): ZodErrorMap;
  function nl(): ZodErrorMap;
  function no(): ZodErrorMap;
  function ota(): ZodErrorMap;
  function ps(): ZodErrorMap;
  function pl(): ZodErrorMap;
  function pt(): ZodErrorMap;
  function ru(): ZodErrorMap;
  function sl(): ZodErrorMap;
  function sv(): ZodErrorMap;
  function ta(): ZodErrorMap;
  function th(): ZodErrorMap;
  function tr(): ZodErrorMap;
  function ua(): ZodErrorMap;
  function uk(): ZodErrorMap;
  function ur(): ZodErrorMap;
  function uz(): ZodErrorMap;
  function vi(): ZodErrorMap;
  function yo(): ZodErrorMap;
  function zhCN(): ZodErrorMap;
  function zhTW(): ZodErrorMap;
}

type ZodErrorMap = (
  issue: ZodIssueOptionalMessage,
  ctx: ErrorMapCtx
) => { message: string };

interface ErrorMapCtx {
  defaultError: string;
  data: any;
}

type ZodIssueOptionalMessage = Omit<ZodIssue, 'message'> & { message?: string };
```
