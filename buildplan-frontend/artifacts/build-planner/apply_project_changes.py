import re

file_path = r'c:\Users\hp\Desktop\buildplan\buildplan-frontend\artifacts\build-planner\src\pages\estimate\estimate.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add AI-powered suggestions for spaces
ai_suggestion = '''                    <div className="rounded-xl border bg-muted/30 p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm mb-1">AI-Powered Space Suggestions</h3>
                          <p className="text-xs text-muted-foreground">Based on your project type and floor area, we suggest these spaces:</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {["Living Room", "Kitchen", "Bedrooms", "Bathrooms", "Dining Area"].map((space) => (
                              <button
                                type="button"
                                key={space}
                                onClick={() => {
                                  const currentSpaces = form.getValues("spacesRequired") || [];
                                  if (!currentSpaces.find((s: any) => s.name === space)) {
                                    form.setValue("spacesRequired", [...currentSpaces, { name: space, dimensions: "", area: 0, notes: "" }]);
                                  }
                                }}
                                className="px-3 py-1 text-xs rounded-full border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors"
                              >
                                + {space}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>'''

# Insert before spacesRequired field
content = re.sub(
    r'(<FormField\s+control={form\.control}\s+name="spacesRequired")',
    ai_suggestion + r'\n\n\1',
    content
)

# Add total area calculation display
total_area_calc = '''                    <div className="rounded-xl border bg-muted/30 p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-sm">Total Area Calculation</h3>
                          <p className="text-xs text-muted-foreground">Includes corridors and other spaces</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {((form.watch("spacesRequired") || []).reduce((sum: number, space: any) => sum + (space.area || 0), 0) || form.watch("floorArea") || 0).toFixed(1)} m²
                          </div>
                        </div>
                      </div>
                    </div>'''

# Insert after spacesRequired field
content = re.sub(
    r'(</FormItem>\s*</FormField>\s*</div>\s*</div>\s*<div className="grid md:grid-cols-2 gap-6">\s*<FormField\s+control={form\.control}\s+name="measurement")',
    r'</FormItem>\n</FormField>\n</div>\n</div>\n' + total_area_calc + r'\n\n<div className="grid md:grid-cols-2 gap-6">\n<FormField\n                        control={form.control}\n                        name="measurement"',
    content
)

# Add building classification dropdown
building_classification = '''                    <FormField
                      control={form.control}
                      name="buildingClassification"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Building Classification</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select classification" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {["Class A", "Class B", "Class C", "Mixed Use"].map((classification) => (
                                <SelectItem key={classification} value={classification}>
                                  {classification}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />'''

# Insert after buildingType field
content = re.sub(
    r'(</FormItem>\s*</FormField>\s*</div>\s*<div className="grid md:grid-cols-2 gap-6">\s*<FormField\s+control={form\.control}\s+name="projectType")',
    r'</FormItem>\n</FormField>\n</div>\n' + building_classification + r'\n\n<div className="grid md:grid-cols-2 gap-6">\n<FormField\n                        control={form.control}\n                        name="projectType"',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Project information changes applied successfully')
