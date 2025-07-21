# Quick Add Modal - User Guide

## Overview

The Quick Add modal is a powerful feature that allows you to quickly create new items (projects, todos, research papers, workouts) from anywhere in the application using a simple keyboard shortcut.

## How to Access

### Keyboard Shortcut (Recommended)
- **Windows/Linux**: `Ctrl + K`
- **Mac**: `Cmd + K`

### Alternative Methods
- Click the blue **+** button in the top navigation bar
- Click "Quick Add" in the mobile menu
- Use the Help menu (`?` key) to see all shortcuts

## Features

### Supported Item Types
1. **Projects** - Track long-term goals and initiatives
2. **Todos** - Manage daily tasks and action items
3. **Research** - Document academic papers and research
4. **Workouts** - Plan and track fitness activities

### Smart Form Fields
The form adapts based on the selected item type:

#### Common Fields (All Types)
- **Title**: Required field for the item name
- **Description**: Optional detailed description
- **Priority**: Low, Medium, or High
- **Due Date**: Optional deadline
- **Category**: Custom categorization
- **Tags**: Multiple tags for organization

#### Type-Specific Fields

**Projects & Todos**
- **Status**: Not Started, In Progress, Completed

**Workouts**
- **Workout Type**: Cardio, Strength, Flexibility, Sports

**Research Papers**
- **Authors**: Author names
- **Journal**: Publication journal
- **Publication Year**: Automatically set to current year

### Tag Management
- Add tags by typing and pressing `Enter` or comma
- Remove tags by clicking the `X` or using `Backspace`
- Tags help with organization and searching

## Tips & Best Practices

### Keyboard Navigation
- Use `Tab` to move between form fields
- Press `Escape` to close the modal
- Press `Enter` to submit the form when focused on the submit button

### Quick Workflow
1. Press `Ctrl+K` from anywhere
2. Select item type (defaults to Project)
3. Enter title (required)
4. Fill optional fields as needed
5. Press `Enter` or click "Create"

### Accessibility
- All form fields are keyboard navigable
- Screen reader compatible
- Clear focus indicators
- Descriptive labels and help text

## Integration

### Data Refresh
After creating an item, the app automatically:
- Refreshes relevant data views
- Emits a `quickAddSuccess` event
- Closes the modal and returns focus

### Error Handling
- Form validation with clear error messages
- Network error handling with retry options
- Graceful fallback if APIs are unavailable

## Developer Notes

### Event System
The modal emits a `quickAddSuccess` custom event when an item is created:

```javascript
window.addEventListener('quickAddSuccess', (event) => {
  console.log('Item created:', event.detail);
  // event.detail contains: { type, item }
});
```

### API Integration
The modal uses existing API endpoints:
- `POST /api/projects` for projects
- `POST /api/todos` for todos  
- `POST /api/research` for research papers
- `POST /api/workouts` for workouts

### Global State
The modal is managed by `QuickAddProvider` which provides:
- Global keyboard shortcut handling
- Modal state management
- Context for triggering from any component

## Troubleshooting

### Keyboard Shortcut Not Working
- Ensure no other app is intercepting `Ctrl+K`
- Check browser extensions that might override shortcuts
- Try the button method as an alternative

### Form Not Submitting
- Ensure the title field is filled (required)
- Check network connection
- Look for validation errors displayed in the form

### Modal Not Appearing
- Check if you're logged in (modal requires authentication)
- Ensure JavaScript is enabled
- Try refreshing the page

## Future Enhancements

The Quick Add modal is designed to be extensible. Future improvements may include:

- Template support for common item patterns
- Bulk creation capabilities
- Integration with external calendars
- Voice input support
- Custom shortcuts for specific item types
- Auto-completion based on previous entries

## Feedback

The Quick Add feature is designed to streamline your productivity workflow. If you have suggestions for improvements or encounter issues, please provide feedback through the app's feedback system. 