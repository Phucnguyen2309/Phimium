export const fallbackGuidelines = {
  pottery: {
    instructions:
      'Wear comfortable clothes and follow the instructor step by step.',
    safetyGuidelines:
      'Keep hands away from the wheel when it is spinning. Stay hydrated and follow venue rules.',
  },
  coffee: {
    instructions: 'Arrive on time and be open to conversation with the group.',
    safetyGuidelines: 'Respect personal space and follow cafe staff guidance.',
  },
  rooftop: {
    instructions: 'Bring your best energy and be ready for social networking.',
    safetyGuidelines:
      'Stay within designated areas and avoid any unsafe edge zones.',
  },
  cowork: {
    instructions:
      'Bring your laptop or notebook and keep the workspace tidy.',
    safetyGuidelines: 'Respect quiet zones and shared equipment.',
  },
}

export const getFallbackGuideline = (id) =>
  fallbackGuidelines[id] ?? fallbackGuidelines.pottery
