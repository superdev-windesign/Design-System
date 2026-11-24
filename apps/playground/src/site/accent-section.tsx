import { AccentPicker, Checkbox, Link, ProgressCircle, Radio, RadioGroup, Rating, Slider, Switch, Tag, TagGroup, Text } from "@windesign-ds/react";

/** A few controls that read the accent, to watch them re-tint. */
export function AccentSpecimen() {
  return (
    <div className="grid grid-cols-1 gap-5 rounded-surface border border-line bg-surface p-5 sm:grid-cols-2">
      <div className="flex flex-col gap-3">
        <Checkbox defaultSelected>Checked box</Checkbox>
        <Switch defaultSelected>Switch on</Switch>
        <RadioGroup aria-label="Plan" defaultValue="team" orientation="horizontal" className="flex gap-4">
          <Radio value="solo">Solo</Radio>
          <Radio value="team">Team</Radio>
        </RadioGroup>
      </div>
      <div className="flex flex-col gap-3">
        <Slider aria-label="Volume" defaultValue={62} />
        <div className="flex items-center gap-4">
          <ProgressCircle aria-label="Upload" value={64} tone="accent" showValue />
          <Rating aria-label="Rating" defaultValue={4} />
        </div>
        <TagGroup aria-label="Topics" selectionMode="multiple" defaultSelectedKeys={["design"]} size="sm">
          <Tag id="design">Design</Tag>
          <Tag id="code">Code</Tag>
        </TagGroup>
      </div>
      <Text size="sm" tone="secondary" className="sm:col-span-2">
        Tab through these to see the focus ring take the accent too. <Link href="#/components/theming">How theming works</Link>
      </Text>
    </div>
  );
}

/** Home page section: one accent, every control. */
export function AccentSection() {
  return (
    <section aria-labelledby="accent" className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
      <header className="flex flex-col gap-3 lg:col-span-5">
        <h2 id="accent" className="text-display-sm tracking-tight text-fg">
          One accent for everything you can press
        </h2>
        <p className="text-body-md text-pretty text-fg-secondary">
          Checked boxes, switches, sliders, selections, focus rings and the dark theme's primary button all read one{" "}
          <code className="font-mono text-body-sm text-fg">--ds-color-accent</code> ramp. Pick a colour and the page re-tints from where you clicked. Chart and
          status colours stay as they are, on purpose.
        </p>
        <p className="text-body-md text-pretty text-fg-secondary">
          The presets are checked for readable button text and visible marks in both themes; a custom colour lands on the 600 stop, and the picker warns you if white
          text on it would be hard to read.
        </p>
        <AccentPicker className="pt-2" />
      </header>
      <div className="lg:col-span-7">
        <AccentSpecimen />
      </div>
    </section>
  );
}
