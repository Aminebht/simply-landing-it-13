import { LandingPageComponent } from '@/types/components';
import { LandingPage, ThemeConfig } from '@/types/landing-page';
import { supabase } from './supabase';
import debounce from 'lodash/debounce';

interface PageSyncState {
  pageId: string;
  components: LandingPageComponent[];
  globalTheme: ThemeConfig | null;
  lastSaved: Date;
  isDirty: boolean;
  isSaving: boolean;
  savePromise: Promise<void> | null;
}

class PageSyncService {
  private static instance: PageSyncService;
  private state: PageSyncState;
  private saveInterval: number | null = null;
  private debouncedSave: ReturnType<typeof debounce>;
  private SAVE_INTERVAL_MS = 30000; // 30 seconds

  private constructor() {
    this.state = {
      pageId: '',
      components: [],
      globalTheme: null,
      lastSaved: new Date(),
      isDirty: false,
      isSaving: false,
      savePromise: null
    };

    // Debounce save to prevent too many simultaneous requests
    this.debouncedSave = debounce(this.saveToDatabase.bind(this), 2000);

    // Setup beforeunload handler to save on page exit
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    }
  }

  public static getInstance(): PageSyncService {
    if (!PageSyncService.instance) {
      PageSyncService.instance = new PageSyncService();
    }
    return PageSyncService.instance;
  }

  /**
   * Initialize the service with a page ID
   */
  public initialize(pageId: string): void {
    this.state.pageId = pageId;
    
    // Set up interval to save periodically
    if (this.saveInterval === null && pageId && pageId !== 'demo-page-id') {
      this.saveInterval = window.setInterval(() => {
        if (this.state.isDirty) {
          this.saveToDatabase();
        }
      }, this.SAVE_INTERVAL_MS);
    }
  }

  /**
   * Update components in memory and mark as dirty
   */
  public updateComponents(components: LandingPageComponent[]): void {
    this.state.components = components;
    this.state.isDirty = true;
    
    // Schedule debounced save to database
    this.debouncedSave();
  }

  /**
   * Update global theme in memory and mark as dirty
   */
  public updateGlobalTheme(theme: ThemeConfig): void {
    this.state.globalTheme = theme;
    this.state.isDirty = true;
    
    // Schedule debounced save to database
    this.debouncedSave();
  }

  /**
   * Update specific component's custom styles in memory and mark as dirty
   * Returns a promise that resolves when the database save is complete
   */
  public async updateComponentCustomStyles(componentId: string, customStyles: Record<string, any>, replaceAll: boolean = false): Promise<void> {
    
    // Verify the component exists before updating
    const componentToUpdate = this.state.components.find(c => c.id === componentId);
    if (!componentToUpdate) {
      console.error('Component not found for custom styles update:', componentId);
      return;
    }
    
    
    // Either replace all styles or deep merge based on flag
    const mergedCustomStyles = replaceAll 
      ? customStyles 
      : this.deepMergeCustomStyles(componentToUpdate.custom_styles || {}, customStyles);
    
    // Clean up the merged styles to ensure proper structure
    const cleanedCustomStyles = this.cleanupCustomStyles(mergedCustomStyles);
    
    
    // Find the component and update it
    const updatedComponents = this.state.components.map(component => {
      if (component.id === componentId) {
        return {
          ...component,
          custom_styles: cleanedCustomStyles,
          updated_at: new Date().toISOString()
        };
      }
      return component;
    });
    
    // Update components in memory
    this.state.components = updatedComponents;
    this.state.isDirty = true;
    
    // Skip database updates for demo page or temporary components
    if (this.state.pageId === 'demo-page-id' || componentId.startsWith('comp-')) {
      return;
    }
    
    // Immediately save to database with direct component update
    try {
      const component = this.state.components.find(c => c.id === componentId);
      if (component) {
        
        // Validate component ID before sending to database
        if (!componentId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          console.error('Invalid component ID format for database operation:', componentId);
          throw new Error(`Invalid component ID format: ${componentId}`);
        }
        
        // Ensure customStyles is properly formatted as a valid JSON object
        const safeCustomStyles = cleanedCustomStyles || {};
        
        // Direct database update for this specific component's custom styles
        const { data: updatedData, error } = await supabase
          .from('landing_page_components')
          .update({
            custom_styles: safeCustomStyles,
            updated_at: new Date().toISOString()
          })
          .eq('id', componentId)
          .select();
          
        if (error) {
          console.error('PageSyncService: Error saving custom styles to database:', error);
          console.error('Error details:', error);
          throw error;
        } else {
          
          // Update last saved time
          this.state.lastSaved = new Date();
          
          // Mark as clean since we just saved successfully
          this.state.isDirty = false;
          return;
        }
      }
    } catch (error) {
      console.error('PageSyncService: Failed to save custom styles to database', error);
      throw error;
    }
  }

  /**
   * Deep merge custom styles objects to preserve existing styles while adding new ones
   */
  private deepMergeCustomStyles(existing: Record<string, any>, newStyles: Record<string, any>): Record<string, any> {
    const result = { ...existing };
    
    // Merge each element's styles
    Object.entries(newStyles).forEach(([elementId, elementStyles]) => {
      if (elementStyles && typeof elementStyles === 'object') {
        // If element already has styles, merge them; otherwise use new styles
        result[elementId] = {
          ...(result[elementId] || {}),
          ...elementStyles
        };
      } else {
        // For non-object values, just set directly
        result[elementId] = elementStyles;
      }
    });
    
    return result;
  }

  /**
   * Clean up custom_styles to ensure backgroundColor is always under container key
   * This prevents global_theme backgroundColor from being saved at root level
   */
  private cleanupCustomStyles(styles: Record<string, any>): Record<string, any> {
    if (!styles || typeof styles !== 'object') {
      return {};
    }

    const cleaned = { ...styles };

    // If there's a root-level backgroundColor, move it to container
    if (cleaned.backgroundColor) {
      
      // Ensure container exists
      if (!cleaned.container) {
        cleaned.container = {};
      }
      
      // Only move to container if container doesn't already have a backgroundColor
      if (!cleaned.container.backgroundColor) {
        cleaned.container.backgroundColor = cleaned.backgroundColor;
      }
      
      // Remove the root-level backgroundColor
      delete cleaned.backgroundColor;
    }

    // Clean up any other root-level style properties that should be under container
    const rootStyleProps = ['color', 'fontFamily', 'fontSize', 'fontWeight', 'textAlign', 'padding', 'margin'];
    rootStyleProps.forEach(prop => {
      if (cleaned[prop] && !cleaned.container?.[prop]) {
        
        if (!cleaned.container) {
          cleaned.container = {};
        }
        
        cleaned.container[prop] = cleaned[prop];
        delete cleaned[prop];
      }
    });

    // Process each element to ensure gradients are under backgroundColor, not background
    Object.entries(cleaned).forEach(([elementId, elementStyles]) => {
      if (elementStyles && typeof elementStyles === 'object') {
        const styles = elementStyles as Record<string, any>;
        
        // If there's a gradient in the 'background' property, move it to 'backgroundColor'
        if (styles.background && typeof styles.background === 'string' && styles.background.includes('gradient')) {
          
          // Only move if backgroundColor doesn't already exist or is empty
          if (!styles.backgroundColor || styles.backgroundColor === '') {
            styles.backgroundColor = styles.background;
          }
          
          // Clear the background property
          styles.background = '';
        }
      }
    });

    return cleaned;
  }

  /**
   * Helper function to sanitize custom_styles for database storage
   * This ensures we only keep serializable values and prevent any circular references
   */
  private sanitizeCustomStyles(styles: Record<string, any>): Record<string, any> {
    if (!styles || typeof styles !== 'object') {
      return {};
    }
    
    const sanitized = {};
    
    // Process each element's styles
    Object.entries(styles).forEach(([elementId, elementStyles]) => {
      if (!elementStyles || typeof elementStyles !== 'object') {
        sanitized[elementId] = {};
        return;
      }
      
      // Process each style property
      const cleanStyles = {};
      Object.entries(elementStyles as Record<string, any>).forEach(([styleKey, styleValue]) => {
        // Skip undefined, null, functions or DOM elements
        if (styleValue === undefined || 
            styleValue === null || 
            typeof styleValue === 'function' ||
            (typeof styleValue === 'object' && styleValue instanceof Element)) {
          return;
        }
        
        // For arrays or objects, stringify and parse to remove any circular references
        if (typeof styleValue === 'object') {
          try {
            const stringValue = JSON.stringify(styleValue);
            cleanStyles[styleKey] = JSON.parse(stringValue);
          } catch (e) {
            console.error(`Failed to stringify complex style value for ${elementId}.${styleKey}:`, e);
            // Skip this value as it can't be safely serialized
          }
        } else {
          // For primitive values (string, number, boolean), store directly
          cleanStyles[styleKey] = styleValue;
        }
      });
      
      sanitized[elementId] = cleanStyles;
    });
    
    return sanitized;
  }


  /**
   * Force immediate save to database
   */
  public async forceSave(): Promise<void> {
    
    if (this.state.pageId === 'demo-page-id') {
      return;
    }
    
    if (!this.state.isDirty) {
      return;
    }

    try {
    
      // Force save to database
      await this.saveToDatabase();
      
    } catch (error) {
    
      throw error; // Re-throw the error to be caught by the caller
    }
  }

  /**
   * Get current components from memory or local storage
   */
  public getComponents(): LandingPageComponent[] {
    return this.state.components;
  }

  /**
   * Get current global theme from memory or local storage
   */
  public getGlobalTheme(): ThemeConfig | null {
    return this.state.globalTheme;
  }

  /**
   * Check if there are unsaved changes
   */
  public isDirty(): boolean {
    return this.state.isDirty;
  }

  /**
   * Get the timestamp when data was last saved
   */
  public getLastSavedTime(): Date | null {
    return this.state.lastSaved || null;
  }

  /**
   * Handle cleanup when service is no longer needed
   */
  public cleanup(): void {
    if (this.saveInterval !== null) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }

    // Force a final save if needed
    if (this.state.isDirty) {
      this.forceSave();
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.handleBeforeUnload);
    }
  }

  /**
   * Save a specific component directly to the database
   */
  public async saveComponentToDatabase(componentId: string): Promise<void> {
    if (this.state.pageId === 'demo-page-id') {
      return;
    }
    
    // Find the component
    const component = this.state.components.find(c => c.id === componentId);
    if (!component) {
      console.error('Component not found for direct save:', componentId);
      return;
    }
    
    // Skip components that don't have database IDs yet
    if (!component.id || component.id.startsWith('comp-')) {
      return;
    }
    
    // ...existing code...
    
    // Detailed custom styles logging
    if (component.custom_styles) {
      // ...existing code...
    } else {
      // ...existing code...
    }
    
    try {
      // Ensure we have valid data for all fields
      // Fix: Ensure custom_styles is properly formatted as a valid JSON object
      const rawCustomStyles = component.custom_styles || {};
      const cleanedCustomStyles = this.cleanupCustomStyles(rawCustomStyles);
      const safeCustomStyles = cleanedCustomStyles;
      
      // Validate custom_styles structure
      let validCustomStyles = true;
      try {
        // Test JSON stringify/parse to ensure it's valid JSON
        const test = JSON.stringify(safeCustomStyles);
        JSON.parse(test);
      } catch (e) {
        console.error('Invalid JSON in custom_styles:', e);
        validCustomStyles = false;
      }
      
      const updateData = {
        content: component.content || {},
        visibility: component.visibility || {},
        custom_styles: validCustomStyles ? safeCustomStyles : {},
        custom_actions: component.custom_actions || {},
        order_index: component.order_index, // Save order_index to maintain component order
        updated_at: new Date().toISOString()
      };
      
      // ...existing code...
      
      // Validate component ID before sending to database
      if (!component.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        console.error('Invalid component ID format for database operation:', component.id);
        throw new Error(`Invalid component ID format: ${component.id}`);
      }
      
      const { data: updatedComponent, error: componentError } = await supabase
        .from('landing_page_components')
        .update(updateData)
        .eq('id', component.id)
        .select();
        
      if (componentError) {
        console.error('Error in direct component update:', componentError);
        console.error('Error details:', JSON.stringify(componentError));
        throw componentError;        } else {
          // ...existing code...
          
          // Update last saved time
          this.state.lastSaved = new Date();
          return;
        }
    } catch (error) {
      console.error('Failed direct component save:', error);
      if (error.message) console.error('Error message:', error.message);
      if (error.details) console.error('Error details:', error.details);
      throw error;
    }
  }

  /**
   * Save current state to the database
   */
  private async saveToDatabase(): Promise<void> {
    if (this.state.isSaving || this.state.pageId === 'demo-page-id' || !this.state.isDirty) {
      return;
    }

    this.state.isSaving = true;
    // ...existing code...

    try {
      // Save the global theme first
      if (this.state.globalTheme) {
        const { error: themeError } = await supabase
          .from('landing_pages')
          .update({ 
            global_theme: this.state.globalTheme,
            updated_at: new Date().toISOString() 
          })
          .eq('id', this.state.pageId);
        if (themeError) {
          console.error('Error saving global theme:', themeError);
          throw themeError;
        }
      }
      
      // Then update all components
      for (const component of this.state.components) {
        // Skip components that don't have database IDs yet
        if (!component.id || component.id.startsWith('comp-')) {
          continue;
        }
        // Ensure we have valid data for all fields - only include fields that exist in the database schema
        // Fix: Use safe object for custom_styles to ensure proper JSONB formatting
        const rawCustomStyles = component.custom_styles || {};
        const cleanedCustomStyles = this.cleanupCustomStyles(rawCustomStyles);
        const safeCustomStyles = cleanedCustomStyles;
        const updateData = {
          content: component.content || {},
          visibility: component.visibility || {},
          custom_styles: safeCustomStyles,
          custom_actions: component.custom_actions || {},
          media_urls: component.media_urls || {}, // Ensure media_urls is included in database updates
          order_index: component.order_index, // Save order_index to maintain component order
          updated_at: new Date().toISOString()
        };
        const { data: updatedComponent, error: componentError } = await supabase
          .from('landing_page_components')
          .update(updateData)
          .eq('id', component.id)
          .select();
        if (componentError) {
          console.error('Error updating component:', componentError);
          throw componentError;
        }
      }

      // Mark as saved
      this.state.isDirty = false;
      this.state.lastSaved = new Date();
      // ...existing code...
      
    } catch (error) {
      console.error('Failed to save to database:', error);
      throw error; // Re-throw the error so it can be handled by the caller
    } finally {
      this.state.isSaving = false;
    }
  }

  /**
   * Handle page unload event
   */
  private handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.state.isDirty) {
      // Try to save changes before unloading
      this.forceSave();
      
      // Show confirmation dialog
      event.preventDefault();
      event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      return event.returnValue;
    }
  }
}

export default PageSyncService;
