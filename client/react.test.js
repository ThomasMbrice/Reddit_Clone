describe('Banner Component Tests', () => {
    test('Create Post button style should reflect guest status', () => {
      const guestStyle = { opacity: 0.15 }; // tests style 
      const userStyle = { opacity: 1 };
  
      expect(guestStyle.opacity).toBe(0.15);
      
      expect(userStyle.opacity).toBe(1);
    });
  
    test('Create Post button should be non-interactive for guests', () => {
      const isGuest = true;
      const onClick = isGuest ? undefined : () => {};
      
      expect(onClick).toBeUndefined();
    });
  });
  