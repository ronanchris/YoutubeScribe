# Figma to React Implementation Guide

This guide outlines the process for implementing Figma designs into the YoutubeScribe React application, using Figma Dev Mode for efficient designer-developer handoff.

## Using Figma Dev Mode for Component Implementation

Figma Dev Mode provides precise specifications that make implementation more accurate and efficient than using screenshots alone. Follow this workflow to implement Figma components in our React application.

### Step 1: Export Component Details from Figma Dev Mode

1. **Open your Figma file in Dev Mode**
   - Click the "Dev Mode" button in the top right of Figma interface
   - Navigate to the component you want to implement

2. **Extract Component CSS**
   - Select the component
   - In the right panel, locate the CSS section
   - Click "Copy" to copy all CSS properties
   - Paste this into our conversation or create a temporary file in the project

3. **Export Design Tokens**
   - Copy color values, typography settings, and spacing information
   - These should be consistent with our design system in `theme.json`

4. **Document Component Structure**
   - Note the component hierarchy and nesting
   - Identify which parts are separate components vs. styling

5. **Capture Variant States**
   - Document different states (normal, hover, active, disabled)
   - Export the CSS for each variant

### Step 2: Implement in React Using Shadcn Components

1. **Identify Matching Shadcn Components**
   - Determine which of our existing UI components most closely match the Figma design
   - Preference should be given to reusing our shadcn component library

2. **Create Component Structure**
   - Build the component hierarchy to match the Figma structure
   - Use shadcn components as base elements when possible

3. **Apply Styling**
   - Use the exported CSS to style components
   - Convert Figma CSS to Tailwind classes where possible
   - For custom styles that cannot be expressed in Tailwind, use CSS modules or inline styles

4. **Add Interactive Behavior**
   - Implement state management for different variants
   - Ensure hover, focus, and active states match the Figma design

### Step 3: Testing and Refinement

1. **Validate Visual Accuracy**
   - Compare the implemented component with the Figma design
   - Check for pixel-perfect alignment, spacing, and typography

2. **Test Responsiveness**
   - Verify that the component behaves correctly at different screen sizes
   - Implement any responsive behaviors documented in Figma

3. **Verify Accessibility**
   - Ensure that the component meets accessibility standards
   - Check contrast ratios, focus states, and semantic HTML structure

## Best Practices for Figma-to-React Workflow

1. **Maintain Design System Consistency**
   - Update `theme.json` if new design tokens are introduced
   - Ensure colors and typography are consistent with the overall design system

2. **Component Reusability**
   - Build components to be reusable across the application
   - Define clear props interfaces based on Figma variants

3. **Documentation**
   - Comment code to explain any complex or non-obvious implementations
   - Note any deviations from the Figma design and the reasons for them

4. **Performance Considerations**
   - Avoid unnecessary nested divs that might be present in the Figma structure
   - Use CSS techniques that minimize rendering overhead

## Example: Translating a Figma Button to React

### Figma Dev Mode Export (Example)
```css
/* Primary Button - Default */
.button {
  display: flex;
  padding: 12px 24px;
  justify-content: center;
  align-items: center;
  gap: 8px;
  border-radius: 6px;
  background: #3b82f6;
  color: white;
  font-weight: 600;
}

/* Primary Button - Hover */
.button:hover {
  background: #2563eb;
}
```

### React Implementation with Shadcn and Tailwind
```tsx
import { Button } from "@/components/ui/button";

// Direct implementation using our existing Button component
const PrimaryButton = ({ children, ...props }) => (
  <Button 
    className="flex justify-center items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md"
    {...props}
  >
    {children}
  </Button>
);

export default PrimaryButton;
```

## Requesting Help with Figma Implementation

When sharing Figma components for implementation, include:

1. The specific component name and location in the Figma file
2. CSS and design token exports from Dev Mode
3. Any special behavior or interaction details
4. How the component should behave responsively
5. Priority level and timeline for implementation

By following this guide, we can efficiently implement Figma designs while maintaining consistency with our existing component system and design language.
