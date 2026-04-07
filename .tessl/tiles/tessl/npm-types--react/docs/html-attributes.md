# HTML Attributes

React provides comprehensive type definitions for HTML and SVG attributes, enabling type-safe attribute usage in JSX elements. The @types/react package includes detailed attribute interfaces for all HTML elements, ARIA attributes, and SVG elements with proper type checking.

## Capabilities

### HTML Attributes Base

Base interface for common HTML attributes shared across all HTML elements.

```typescript { .api }
/**
 * Base HTML attributes available on all HTML elements
 * @template T The HTML element type
 */
interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
  // Standard HTML attributes
  className?: string;
  id?: string;
  lang?: string;
  placeholder?: string;
  slot?: string;
  spellCheck?: Booleanish;
  style?: CSSProperties;
  tabIndex?: number;
  title?: string;
  translate?: 'yes' | 'no';

  // Microdata
  itemID?: string;
  itemProp?: string;
  itemRef?: string;
  itemScope?: boolean;
  itemType?: string;

  // Living Standard
  autoCapitalize?: string;
  autoCorrect?: string;
  autoSave?: string;
  color?: string;
  itemID?: string;
  itemProp?: string;
  itemRef?: string;
  itemScope?: boolean;
  itemType?: string;
  results?: number;
  security?: string;
  unselectable?: 'on' | 'off';

  // Standard HTML Attributes
  accessKey?: string;
  contentEditable?: Booleanish | "inherit";
  contextMenu?: string;
  dir?: "auto" | "ltr" | "rtl";
  draggable?: Booleanish;
  hidden?: boolean;
  inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search";
  is?: string;
  radioGroup?: string;
  role?: AriaRole;
  suppressContentEditableWarning?: boolean;
  suppressHydrationWarning?: boolean;
}

/**
 * Boolean-ish type for HTML attributes that accept boolean-like values
 */
type Booleanish = boolean | "true" | "false";
```

**Usage Examples:**

```typescript
import React, { CSSProperties } from "react";

// Using base HTML attributes
function BaseAttributesDemo() {
  const divStyle: CSSProperties = {
    padding: '10px',
    backgroundColor: 'lightblue',
    borderRadius: '4px'
  };

  return (
    <div>
      {/* Basic attributes */}
      <div
        id="main-content"
        className="container primary"
        style={divStyle}
        title="This is the main content area"
        lang="en"
        dir="ltr"
      >
        Main Content
      </div>

      {/* Accessibility and interaction attributes */}
      <div
        tabIndex={0}
        role="button"
        accessKey="m"
        contentEditable={true}
        draggable={true}
        spellCheck={false}
      >
        Interactive Element
      </div>

      {/* Microdata attributes */}
      <div
        itemScope
        itemType="https://schema.org/Person"
        itemID="person-1"
      >
        <span itemProp="name">John Doe</span>
        <span itemProp="email">john@example.com</span>
      </div>

      {/* Modern attributes */}
      <input
        type="text"
        inputMode="email"
        autoCapitalize="none"
        autoCorrect="off"
        autoSave="username"
      />
    </div>
  );
}
```

### Element-Specific Attributes

Specialized attribute interfaces for specific HTML elements.

```typescript { .api }
/**
 * Attributes for anchor elements
 */
interface AnchorHTMLAttributes<T> extends HTMLAttributes<T> {
  download?: any;
  href?: string;
  hrefLang?: string;
  media?: string;
  ping?: string;
  rel?: string;
  target?: HTMLAttributeAnchorTarget;
  type?: string;
  referrerPolicy?: HTMLAttributeReferrerPolicy;
}

/**
 * Attributes for button elements
 */
interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
  autoFocus?: boolean;
  disabled?: boolean;
  form?: string;
  formAction?: string;
  formEncType?: string;
  formMethod?: string;
  formNoValidate?: boolean;
  formTarget?: string;
  name?: string;
  type?: 'submit' | 'reset' | 'button';
  value?: string | ReadonlyArray<string> | number;
}

/**
 * Attributes for input elements
 */
interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
  accept?: string;
  alt?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  capture?: boolean | 'user' | 'environment';
  checked?: boolean;
  crossOrigin?: string;
  disabled?: boolean;
  enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
  form?: string;
  formAction?: string;
  formEncType?: string;
  formMethod?: string;
  formNoValidate?: boolean;
  formTarget?: string;
  height?: number | string;
  list?: string;
  max?: number | string;
  maxLength?: number;
  min?: number | string;
  minLength?: number;
  multiple?: boolean;
  name?: string;
  pattern?: string;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  size?: number;
  src?: string;
  step?: number | string;
  type?: HTMLInputTypeAttribute;
  value?: string | ReadonlyArray<string> | number;
  width?: number | string;
}

/**
 * Attributes for form elements
 */
interface FormHTMLAttributes<T> extends HTMLAttributes<T> {
  acceptCharset?: string;
  action?: string;
  autoComplete?: string;
  encType?: string;
  method?: string;
  name?: string;
  noValidate?: boolean;
  target?: string;
}

/**
 * Attributes for img elements
 */
interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
  alt?: string;
  crossOrigin?: "anonymous" | "use-credentials" | "";
  decoding?: "async" | "auto" | "sync";
  height?: number | string;
  loading?: "eager" | "lazy";
  referrerPolicy?: HTMLAttributeReferrerPolicy;
  sizes?: string;
  src?: string;
  srcSet?: string;
  useMap?: string;
  width?: number | string;
}
```

**Usage Examples:**

```typescript
import React, { useState } from "react";

function ElementAttributesDemo() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    website: '',
    newsletter: false
  });

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div>
      {/* Anchor with all relevant attributes */}
      <a
        href="https://example.com"
        target="_blank"
        rel="noopener noreferrer"
        download="file.pdf"
        hrefLang="en"
        type="application/pdf"
        referrerPolicy="strict-origin-when-cross-origin"
      >
        Download PDF
      </a>

      {/* Form with comprehensive attributes */}
      <form
        onSubmit={handleSubmit}
        method="POST"
        action="/api/submit"
        encType="multipart/form-data"
        acceptCharset="UTF-8"
        noValidate={false}
        autoComplete="on"
      >
        {/* Text input with validation */}
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter your name"
          required
          minLength={2}
          maxLength={50}
          pattern="[A-Za-z\s]+"
          autoComplete="name"
          autoFocus
        />

        {/* Email input */}
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your email"
          required
          autoComplete="email"
          enterKeyHint="next"
        />

        {/* Number input */}
        <input
          type="number"
          name="age"
          value={formData.age}
          onChange={handleInputChange}
          placeholder="Age"
          min={18}
          max={120}
          step={1}
          required
        />

        {/* URL input */}
        <input
          type="url"
          name="website"
          value={formData.website}
          onChange={handleInputChange}
          placeholder="https://example.com"
          pattern="https://.*"
          autoComplete="url"
        />

        {/* Checkbox */}
        <input
          type="checkbox"
          name="newsletter"
          checked={formData.newsletter}
          onChange={handleInputChange}
          id="newsletter"
        />
        <label htmlFor="newsletter">Subscribe to newsletter</label>

        {/* Submit button */}
        <button
          type="submit"
          disabled={!formData.name || !formData.email}
        >
          Submit
        </button>

        {/* Reset button */}
        <button type="reset">Reset</button>
      </form>

      {/* Image with all attributes */}
      <img
        src="/images/hero.jpg"
        alt="Hero image"
        width={800}
        height={400}
        loading="lazy"
        decoding="async"
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        srcSet="/images/hero-400.jpg 400w, /images/hero-800.jpg 800w"
        sizes="(max-width: 400px) 400px, 800px"
      />
    </div>
  );
}
```

### ARIA Attributes

Comprehensive ARIA (Accessible Rich Internet Applications) attributes for accessibility.

```typescript { .api }
/**
 * WAI-ARIA attributes interface
 */
interface AriaAttributes {
  /** Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. */
  "aria-activedescendant"?: string;
  /** Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. */
  "aria-atomic"?: Booleanish;
  /** Indicates whether inputting text could trigger display of one or more predictions of the user's intended input. */
  "aria-autocomplete"?: "none" | "inline" | "list" | "both";
  /** Indicates an element is being modified and that assistive technologies MAY want to wait until the modifications are complete before exposing them to the user. */
  "aria-busy"?: Booleanish;
  /** Indicates the current "checked" state of checkboxes, radio buttons, and other widgets. */
  "aria-checked"?: boolean | "false" | "mixed" | "true";
  /** Defines the total number of columns in a table, grid, or treegrid. */
  "aria-colcount"?: number;
  /** Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid. */
  "aria-colindex"?: number;
  /** Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid. */
  "aria-colspan"?: number;
  /** Identifies the element (or elements) whose contents or presence are controlled by the current element. */
  "aria-controls"?: string;
  /** Indicates the element that represents the current item within a container or set of related elements. */
  "aria-current"?: boolean | "false" | "true" | "page" | "step" | "location" | "date" | "time";
  /** Identifies the element (or elements) that describes the object. */
  "aria-describedby"?: string;
  /** Identifies the element that provides a detailed, extended description for the object. */
  "aria-details"?: string;
  /** Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable. */
  "aria-disabled"?: Booleanish;
  /** Indicates what functions can be performed when a dragged object is released on the drop target. */
  "aria-dropeffect"?: "none" | "copy" | "execute" | "link" | "move" | "popup";
  /** Identifies the element that provides an error message for the object. */
  "aria-errormessage"?: string;
  /** Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. */
  "aria-expanded"?: Booleanish;
  /** Identifies the next element (or elements) in an alternate reading order of content. */
  "aria-flowto"?: string;
  /** Indicates an element's "grabbed" state in a drag-and-drop operation. */
  "aria-grabbed"?: Booleanish;
  /** Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. */
  "aria-haspopup"?: boolean | "false" | "true" | "menu" | "listbox" | "tree" | "grid" | "dialog";
  /** Indicates whether the element is exposed to an accessibility API. */
  "aria-hidden"?: Booleanish;
  /** Indicates the entered value does not conform to the format expected by the application. */
  "aria-invalid"?: boolean | "false" | "true" | "grammar" | "spelling";
  /** Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. */
  "aria-keyshortcuts"?: string;
  /** Defines a string value that labels the current element. */
  "aria-label"?: string;
  /** Identifies the element (or elements) that labels the current element. */
  "aria-labelledby"?: string;
  /** Defines the hierarchical level of an element within a structure. */
  "aria-level"?: number;
  /** Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. */
  "aria-live"?: "off" | "assertive" | "polite";
  /** Indicates whether an element is modal when displayed. */
  "aria-modal"?: Booleanish;
  /** Indicates whether a text box accepts multiple lines of input or only a single line. */
  "aria-multiline"?: Booleanish;
  /** Indicates that the user may select more than one item from the current selectable descendants. */
  "aria-multiselectable"?: Booleanish;
  /** Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. */
  "aria-orientation"?: "horizontal" | "vertical";
  /** Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship between DOM elements where the DOM hierarchy cannot be used to represent the relationship. */
  "aria-owns"?: string;
  /** Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value. */
  "aria-placeholder"?: string;
  /** Defines an element's number or position in the current set of listitems or treeitems. */
  "aria-posinset"?: number;
  /** Indicates the current "pressed" state of toggle buttons. */
  "aria-pressed"?: boolean | "false" | "mixed" | "true";
  /** Indicates that the element is not editable, but is otherwise operable. */
  "aria-readonly"?: Booleanish;
  /** Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified. */
  "aria-relevant"?: "additions" | "additions removals" | "additions text" | "all" | "removals" | "removals additions" | "removals text" | "text" | "text additions" | "text removals";
  /** Indicates that user input is required on the element before a form may be submitted. */
  "aria-required"?: Booleanish;
  /** Defines a human-readable, author-localized description for the role of an element. */
  "aria-roledescription"?: string;
  /** Defines the total number of rows in a table, grid, or treegrid. */
  "aria-rowcount"?: number;
  /** Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid. */
  "aria-rowindex"?: number;
  /** Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid. */
  "aria-rowspan"?: number;
  /** Indicates the current "selected" state of various widgets. */
  "aria-selected"?: Booleanish;
  /** Defines the number of items in the current set of listitems or treeitems. */
  "aria-setsize"?: number;
  /** Indicates if items in a table or grid are sorted in ascending or descending order. */
  "aria-sort"?: "none" | "ascending" | "descending" | "other";
  /** Defines the maximum allowed value for a range widget. */
  "aria-valuemax"?: number;
  /** Defines the minimum allowed value for a range widget. */
  "aria-valuemin"?: number;
  /** Defines the current value for a range widget. */
  "aria-valuenow"?: number;
  /** Defines the human readable text alternative of aria-valuenow for a range widget. */
  "aria-valuetext"?: string;
}

/**
 * ARIA roles
 */
type AriaRole =
  | "alert"
  | "alertdialog"
  | "application"
  | "article"
  | "banner"
  | "button"
  | "cell"
  | "checkbox"
  | "columnheader"
  | "combobox"
  | "complementary"
  | "contentinfo"
  | "definition"
  | "dialog"
  | "directory"
  | "document"
  | "feed"
  | "figure"
  | "form"
  | "grid"
  | "gridcell"
  | "group"
  | "heading"
  | "img"
  | "link"
  | "list"
  | "listbox"
  | "listitem"
  | "log"
  | "main"
  | "marquee"
  | "math"
  | "menu"
  | "menubar"
  | "menuitem"
  | "menuitemcheckbox"
  | "menuitemradio"
  | "navigation"
  | "none"
  | "note"
  | "option"
  | "presentation"
  | "progressbar"
  | "radio"
  | "radiogroup"
  | "region"
  | "row"
  | "rowgroup"
  | "rowheader"
  | "scrollbar"
  | "search"
  | "searchbox"
  | "separator"
  | "slider"
  | "spinbutton"
  | "status"
  | "switch"
  | "tab"
  | "table"
  | "tablist"
  | "tabpanel"
  | "term"
  | "textbox"
  | "timer"
  | "toolbar"
  | "tooltip"
  | "tree"
  | "treegrid"
  | "treeitem"
  | (string & {});
```

**Usage Examples:**

```typescript
import React, { useState } from "react";

function AccessibilityDemo() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [sliderValue, setSliderValue] = useState(50);

  return (
    <div>
      {/* Expandable section with ARIA */}
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls="expandable-content"
          aria-describedby="expand-help"
        >
          {isExpanded ? 'Collapse' : 'Expand'} Details
        </button>
        <div id="expand-help" aria-hidden>
          Click to toggle content visibility
        </div>
        
        <div
          id="expandable-content"
          aria-hidden={!isExpanded}
          role="region"
          aria-labelledby="section-title"
        >
          <h3 id="section-title">Detailed Information</h3>
          <p>This content can be expanded or collapsed.</p>
        </div>
      </div>

      {/* Tab interface with ARIA */}
      <div role="tablist" aria-label="Settings tabs">
        {['General', 'Privacy', 'Advanced'].map((tabName, index) => (
          <button
            key={tabName}
            role="tab"
            aria-selected={selectedTab === index}
            aria-controls={`tabpanel-${index}`}
            id={`tab-${index}`}
            tabIndex={selectedTab === index ? 0 : -1}
            onClick={() => setSelectedTab(index)}
          >
            {tabName}
          </button>
        ))}
        
        {['General settings content', 'Privacy settings content', 'Advanced settings content'].map((content, index) => (
          <div
            key={index}
            role="tabpanel"
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            hidden={selectedTab !== index}
            tabIndex={0}
          >
            {content}
          </div>
        ))}
      </div>

      {/* Custom slider with ARIA */}
      <div>
        <label id="slider-label">Volume Control</label>
        <div
          role="slider"
          aria-labelledby="slider-label"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={sliderValue}
          aria-valuetext={`${sliderValue} percent`}
          tabIndex={0}
          style={{
            width: '200px',
            height: '20px',
            backgroundColor: '#ddd',
            position: 'relative',
            cursor: 'pointer'
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const newValue = Math.round(((e.clientX - rect.left) / rect.width) * 100);
            setSliderValue(Math.max(0, Math.min(100, newValue)));
          }}
        >
          <div
            style={{
              width: `${sliderValue}%`,
              height: '100%',
              backgroundColor: '#007bff'
            }}
          />
        </div>
      </div>

      {/* Form with comprehensive ARIA */}
      <form role="form" aria-labelledby="form-title">
        <h2 id="form-title">Contact Form</h2>
        
        <div>
          <label htmlFor="name-input" id="name-label">Name *</label>
          <input
            id="name-input"
            type="text"
            required
            aria-labelledby="name-label"
            aria-describedby="name-help name-error"
            aria-required={true}
            aria-invalid={false}
          />
          <div id="name-help">Enter your full name</div>
          <div id="name-error" role="alert" aria-live="polite" style={{ color: 'red', display: 'none' }}>
            Name is required
          </div>
        </div>

        <fieldset>
          <legend>Preferred Contact Method</legend>
          <div role="radiogroup" aria-labelledby="contact-legend">
            <input
              type="radio"
              id="email-contact"
              name="contact"
              value="email"
              aria-describedby="contact-help"
            />
            <label htmlFor="email-contact">Email</label>
            
            <input
              type="radio"
              id="phone-contact"
              name="contact"
              value="phone"
              aria-describedby="contact-help"
            />
            <label htmlFor="phone-contact">Phone</label>
          </div>
          <div id="contact-help">Select your preferred way to be contacted</div>
        </fieldset>

        <button
          type="submit"
          aria-describedby="submit-help"
        >
          Submit Form
        </button>
        <div id="submit-help">Press to submit the contact form</div>
      </form>

      {/* Live region for announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic={true}
        style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px', overflow: 'hidden' }}
      >
        Form submitted successfully!
      </div>
    </div>
  );
}
```

### SVG Attributes

Comprehensive SVG attribute interface for SVG elements.

```typescript { .api }
/**
 * SVG attributes interface
 * @template T The SVG element type
 */
interface SVGAttributes<T> extends AriaAttributes, DOMAttributes<T> {
  // SVG-specific attributes
  className?: string;
  color?: string;
  height?: number | string;
  id?: string;
  lang?: string;
  max?: number | string;
  media?: string;
  method?: string;
  min?: number | string;
  name?: string;
  style?: CSSProperties;
  target?: string;
  type?: string;
  width?: number | string;

  // SVG Presentation Attributes
  alignmentBaseline?: "auto" | "baseline" | "before-edge" | "text-before-edge" | "middle" | "central" | "after-edge" | "text-after-edge" | "ideographic" | "alphabetic" | "hanging" | "mathematical" | "inherit";
  baselineShift?: number | string;
  clip?: string;
  clipPath?: string;
  clipRule?: "nonzero" | "evenodd" | "inherit";
  color?: string;
  colorInterpolation?: "auto" | "sRGB" | "linearRGB" | "inherit";
  colorInterpolationFilters?: "auto" | "sRGB" | "linearRGB" | "inherit";
  colorProfile?: string;
  colorRendering?: "auto" | "optimizeSpeed" | "optimizeQuality" | "inherit";
  cursor?: string;
  direction?: "ltr" | "rtl" | "inherit";
  display?: string;
  dominantBaseline?: "auto" | "text-bottom" | "alphabetic" | "ideographic" | "middle" | "central" | "mathematical" | "hanging" | "text-top";
  enableBackground?: string;
  fill?: string;
  fillOpacity?: number | string;
  fillRule?: "nonzero" | "evenodd" | "inherit";
  filter?: string;
  floodColor?: string;
  floodOpacity?: number | string;
  fontFamily?: string;
  fontSize?: number | string;
  fontSizeAdjust?: number | string;
  fontStretch?: string;
  fontStyle?: "normal" | "italic" | "oblique" | "inherit";
  fontVariant?: string;
  fontWeight?: number | string;
  glyphOrientationHorizontal?: string;
  glyphOrientationVertical?: string;
  imageRendering?: "auto" | "optimizeSpeed" | "optimizeQuality" | "inherit";
  kerning?: string;
  letterSpacing?: number | string;
  lightingColor?: string;
  markerEnd?: string;
  markerMid?: string;
  markerStart?: string;
  mask?: string;
  opacity?: number | string;
  overflow?: "visible" | "hidden" | "scroll" | "auto" | "inherit";
  pointerEvents?: "visiblePainted" | "visibleFill" | "visibleStroke" | "visible" | "painted" | "fill" | "stroke" | "all" | "none" | "inherit";
  shapeRendering?: "auto" | "optimizeSpeed" | "crispEdges" | "geometricPrecision" | "inherit";
  stopColor?: string;
  stopOpacity?: number | string;
  stroke?: string;
  strokeDasharray?: string | number;
  strokeDashoffset?: string | number;
  strokeLinecap?: "butt" | "round" | "square" | "inherit";
  strokeLinejoin?: "miter" | "round" | "bevel" | "inherit";
  strokeMiterlimit?: number | string;
  strokeOpacity?: number | string;
  strokeWidth?: number | string;
  textAnchor?: "start" | "middle" | "end" | "inherit";
  textDecoration?: "none" | "underline" | "overline" | "line-through" | "blink" | "inherit";
  textRendering?: "auto" | "optimizeSpeed" | "optimizeLegibility" | "geometricPrecision" | "inherit";
  unicodeBidi?: string;
  visibility?: "visible" | "hidden" | "collapse" | "inherit";
  wordSpacing?: number | string;
  writingMode?: "lr-tb" | "rl-tb" | "tb-rl" | "lr" | "rl" | "tb" | "inherit";

  // SVG Element-Specific Attributes
  cx?: number | string;
  cy?: number | string;
  d?: string;
  dx?: number | string;
  dy?: number | string;
  fx?: number | string;
  fy?: number | string;
  gradientTransform?: string;
  gradientUnits?: string;
  markerHeight?: number | string;
  markerUnits?: string;
  markerWidth?: number | string;
  patternContentUnits?: string;
  patternUnits?: string;
  patternTransform?: string;
  points?: string;
  preserveAspectRatio?: string;
  r?: number | string;
  refX?: number | string;
  refY?: number | string;
  repeatCount?: number | string;
  repeatDur?: number | string;
  requiredExtensions?: string;
  requiredFeatures?: string;
  rx?: number | string;
  ry?: number | string;
  spreadMethod?: string;
  systemLanguage?: string;
  transform?: string;
  viewBox?: string;
  x?: number | string;
  x1?: number | string;
  x2?: number | string;
  xlinkActuate?: string;
  xlinkArcrole?: string;
  xlinkHref?: string;
  xlinkRole?: string;
  xlinkShow?: string;
  xlinkTitle?: string;
  xlinkType?: string;
  xmlBase?: string;
  xmlLang?: string;
  xmlns?: string;
  xmlnsXlink?: string;
  xmlSpace?: string;
  y?: number | string;
  y1?: number | string;
  y2?: number | string;
}
```

**Usage Examples:**

```typescript
import React from "react";

function SVGDemo() {
  return (
    <div>
      {/* Complex SVG with various elements and attributes */}
      <svg
        width="400"
        height="300"
        viewBox="0 0 400 300"
        xmlns="http://www.w3.org/2000/svg"
        style={{ border: '1px solid #ccc' }}
      >
        {/* Gradient definitions */}
        <defs>
          <linearGradient
            id="blueGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="#007bff" stopOpacity={1} />
            <stop offset="100%" stopColor="#0056b3" stopOpacity={1} />
          </linearGradient>
          
          <pattern
            id="dots"
            patternUnits="userSpaceOnUse"
            width="20"
            height="20"
            patternTransform="rotate(45)"
          >
            <circle cx="10" cy="10" r="2" fill="#ff6b6b" />
          </pattern>
        </defs>

        {/* Rectangle with gradient fill */}
        <rect
          x="50"
          y="50"
          width="100"
          height="80"
          fill="url(#blueGradient)"
          stroke="#333"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          rx="5"
          ry="5"
          opacity={0.8}
        />

        {/* Circle with pattern fill */}
        <circle
          cx="250"
          cy="90"
          r="40"
          fill="url(#dots)"
          stroke="#333"
          strokeWidth="2"
          strokeDasharray="5,5"
          strokeDashoffset="2"
        />

        {/* Path element */}
        <path
          d="M 100 200 Q 200 150 300 200 T 400 200"
          fill="none"
          stroke="#28a745"
          strokeWidth="3"
          strokeLinecap="round"
          markerEnd="url(#arrow)"
        />

        {/* Text with various attributes */}
        <text
          x="200"
          y="250"
          textAnchor="middle"
          fontSize="16"
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
          fill="#333"
          textDecoration="underline"
        >
          SVG Text Example
        </text>

        {/* Group with transform */}
        <g transform="translate(300, 200) rotate(45)">
          <rect
            x="-15"
            y="-15"
            width="30"
            height="30"
            fill="#ffc107"
            stroke="#fd7e14"
            strokeWidth="2"
          />
        </g>

        {/* Polyline */}
        <polyline
          points="50,250 75,230 100,250 125,230 150,250"
          fill="none"
          stroke="#dc3545"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Ellipse */}
        <ellipse
          cx="350"
          cy="100"
          rx="30"
          ry="20"
          fill="#6f42c1"
          fillOpacity={0.6}
          stroke="#495057"
          strokeWidth="1"
        />
      </svg>

      {/* Interactive SVG elements */}
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r="50"
          fill="#007bff"
          stroke="#0056b3"
          strokeWidth="2"
          style={{ cursor: 'pointer' }}
          onMouseEnter={(e) => {
            e.currentTarget.setAttribute('fill', '#0056b3');
          }}
          onMouseLeave={(e) => {
            e.currentTarget.setAttribute('fill', '#007bff');
          }}
          onClick={() => alert('Circle clicked!')}
        />
      </svg>

      {/* SVG with accessibility */}
      <svg
        width="150"
        height="150"
        viewBox="0 0 150 150"
        role="img"
        aria-labelledby="chart-title"
        aria-describedby="chart-desc"
      >
        <title id="chart-title">Simple Bar Chart</title>
        <desc id="chart-desc">A chart showing three bars with values 30, 70, and 50</desc>
        
        <rect x="20" y="120" width="20" height="30" fill="#007bff" aria-label="Bar 1: 30" />
        <rect x="50" y="80" width="20" height="70" fill="#28a745" aria-label="Bar 2: 70" />
        <rect x="80" y="100" width="20" height="50" fill="#ffc107" aria-label="Bar 3: 50" />
      </svg>
    </div>
  );
}
```

### CSS Properties Interface

Type definition for CSS properties used in the style attribute.

```typescript { .api }
/**
 * CSS properties interface for React style attribute
 */
interface CSSProperties extends CSS.Properties<string | number> {
  /**
   * CSS custom properties (CSS variables)
   */
  [key: `--${string}`]: string | number | undefined;
}
```

**Usage Examples:**

```typescript
import React, { CSSProperties } from "react";

function CSSPropertiesDemo() {
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    fontFamily: 'Arial, sans-serif',
    // CSS custom properties
    '--primary-color': '#007bff',
    '--secondary-color': '#6c757d',
    '--border-radius': '8px'
  };

  const cardStyle: CSSProperties = {
    backgroundColor: 'white',
    borderRadius: 'var(--border-radius)',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '2rem',
    maxWidth: '400px',
    width: '100%',
    margin: '1rem',
    transform: 'translateY(0)',
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 12px rgba(0, 0, 0, 0.15)'
    }
  };

  const buttonStyle: CSSProperties = {
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--border-radius)',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    outline: 'none',
    ':focus': {
      boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.25)'
    },
    ':active': {
      backgroundColor: '#0056b3'
    }
  };

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gridGap: '1rem',
    width: '100%',
    maxWidth: '800px'
  };

  return (
    <div style={containerStyle}>
      <div style={gridStyle}>
        <div style={cardStyle}>
          <h3 style={{ color: 'var(--primary-color)', margin: '0 0 1rem 0' }}>
            Card Title
          </h3>
          <p style={{ color: 'var(--secondary-color)', lineHeight: 1.6 }}>
            This is a card with CSS-in-JS styling using TypeScript.
          </p>
          <button style={buttonStyle}>
            Action Button
          </button>
        </div>

        <div style={cardStyle}>
          <h3 style={{ color: 'var(--primary-color)', margin: '0 0 1rem 0' }}>
            Another Card
          </h3>
          <p style={{ color: 'var(--secondary-color)', lineHeight: 1.6 }}>
            All styles are fully typed and support CSS custom properties.
          </p>
          <button 
            style={{
              ...buttonStyle,
              backgroundColor: 'var(--secondary-color)'
            }}
          >
            Secondary Action
          </button>
        </div>
      </div>
    </div>
  );
}

// Utility function for responsive styles
function createResponsiveStyle(mobile: CSSProperties, desktop?: CSSProperties): CSSProperties {
  return {
    ...mobile,
    '@media (min-width: 768px)': desktop || {}
  };
}

// Usage of responsive styles
function ResponsiveComponent() {
  const responsiveStyle = createResponsiveStyle(
    {
      fontSize: '14px',
      padding: '0.5rem'
    },
    {
      fontSize: '16px',
      padding: '1rem'
    }
  );

  return (
    <div style={responsiveStyle}>
      Responsive content
    </div>
  );
}
```