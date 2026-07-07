import re

file_path = r'c:\Users\hp\Desktop\buildplan\buildplan-frontend\artifacts\build-planner\src\pages\estimate.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add exact location field after country dropdown
location_field_pattern = r'(<SelectContent>\s*{LOCATION_OPTIONS\.map.*?</SelectContent>\s*</Select>\s*<FormMessage />\s*</FormItem>)'
location_field_replacement = r'''\1
                      <FormField
                        control={form.control}
                        name="siteLocation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Specify exact location within chosen country</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter exact location (free typing)" {...field} />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">Provide the specific location within the selected country.</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />'''

content = re.sub(location_field_pattern, location_field_replacement, content, flags=re.DOTALL)

# Add site setting dropdown in Site Features section
site_setting_field = '''                      <FormField
                        control={form.control}
                        name="siteSetting"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Setting</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select site setting" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {SITE_SETTINGS.map((setting) => (
                                  <SelectItem key={setting} value={setting}>
                                    {setting}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />'''

# Insert after siteAccessibility field
content = re.sub(
    r'(</FormItem>\s*</FormField>\s*</div>\s*<FormField\s+control={form\.control}\s+name="accessWays")',
    r'</FormItem>\n</FormField>\n</div>\n' + site_setting_field + r'\n\n\1',
    content
)

# Add add-on services checklist
add_on_services = '''                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Add-on Services</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {ADD_ON_SERVICES.map((service) => (
                          <FormField
                            key={service}
                            control={form.control}
                            name="addOnServices"
                            render={({ field }) => {
                              const services = Array.isArray(field.value) ? field.value : [];
                              return (
                                <FormItem className="rounded-xl border p-3 flex flex-row items-start gap-3">
                                  <FormControl>
                                    <Checkbox
                                      checked={services.includes(service)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          field.onChange([...services, service]);
                                        } else {
                                          field.onChange(services.filter((s) => s !== service));
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-sm">{service}</FormLabel>
                                  </div>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                    </div>'''

# Insert after topographic survey section
content = re.sub(
    r'(</FormItem>\s*</FormField>\s*</div>\s*</div>\s*<FormField\s+control={form\.control}\s+name="specialViews")',
    r'</FormItem>\n</FormField>\n</div>\n</div>\n' + add_on_services + r'\n\n\1',
    content
)

# Change submit button text to "Engage"
content = re.sub(
    r'(Proceed to Estimated Costs and Service Fees)',
    r'Engage',
    content
)

# Add popup message after submit button
submit_popup = '''                    {isPending ? (
                      <Button disabled>Saving estimate...</Button>
                    ) : (
                      <>
                        <Button type="submit">Engage</Button>
                        <p className="text-xs text-muted-foreground mt-2">Typically responds within 24 hours</p>
                      </>
                    )}'''

content = re.sub(
    r'(<Button type="submit" disabled={isPending}>\s*{isPending \? "Saving estimate\.\.\." : "Engage"}\s*</Button>)',
    submit_popup,
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Complex changes applied successfully')
