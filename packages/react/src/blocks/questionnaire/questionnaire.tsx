"use client";

import { useState } from "react";
import { CheckboxGroup } from "react-aria-components";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";
import { RiCheckLine } from "@remixicon/react";
import { Button } from "../../components/button/button";
import { CheckboxCard } from "../../components/checkbox/checkbox-card";
import { Input } from "../../components/input/input";
import { RadioCard } from "../../components/radio/radio-card";
import { RadioGroup } from "../../components/radio/radio";
import { useDirection } from "../../foundations/direction";
import { easing, layoutSpring } from "../../motion/tokens";
import { cx } from "../../utils/cx";

/**
 * Questionnaire: the questions an agent asks before it plans, one at a time.
 * Each question is single or multiple choice and can allow a free-text
 * "Other". Questions slide in the direction of travel; the dots above track
 * progress, and the last step shows the answers back before sending.
 */

export interface QuestionOption {
  id: string;
  label: string;
  description?: string;
}

export interface Question {
  id: string;
  prompt: string;
  description?: string;
  options: QuestionOption[];
  /** Allow several answers. */
  multiple?: boolean;
  /** Add an "Other" option with a text field. */
  allowOther?: boolean;
  /** Can be skipped without an answer. */
  optional?: boolean;
}

export interface Answer {
  /** Chosen option ids. */
  selected: string[];
  /** Free text when "Other" is chosen. */
  other?: string;
}

export type Answers = Record<string, Answer>;

export interface QuestionnaireProps {
  questions: Question[];
  title?: string;
  onComplete?: (answers: Answers) => void;
  submitLabel?: string;
  className?: string;
}

const OTHER = "__other";

export function Questionnaire({ questions, title = "A few questions first", onComplete, submitLabel = "Send answers", className }: QuestionnaireProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  const [sent, setSent] = useState(false);
  const reduceMotion = useReducedMotion() ?? false;
  const isRtl = useDirection() === "rtl";

  const reviewing = index === questions.length;
  const question = questions[index];
  const answer = question ? answers[question.id] ?? { selected: [] } : undefined;
  const answered = !!answer && (answer.selected.some((s) => s !== OTHER) || (answer.selected.includes(OTHER) && !!answer.other?.trim()));

  const setAnswer = (patch: Partial<Answer>) => {
    if (!question) return;
    setAnswers((prev) => ({ ...prev, [question.id]: { selected: [], ...prev[question.id], ...patch } }));
  };

  const go = (next: number) => {
    setDirection(next > index ? 1 : -1);
    setIndex(next);
  };

  const labelFor = (q: Question, a: Answer | undefined) =>
    !a || a.selected.length === 0
      ? "Skipped"
      : a.selected.map((id) => (id === OTHER ? a.other?.trim() || "Other" : q.options.find((o) => o.id === id)?.label ?? id)).join(", ");

  const sign = isRtl ? -1 : 1;
  const variants: Variants = {
    enter: (d: number) => ({ x: reduceMotion ? 0 : d * sign * 32, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: reduceMotion ? 0 : -d * sign * 32, opacity: 0 }),
  };

  return (
    <section className={cx("flex w-full flex-col gap-5 rounded-2xl border border-line bg-surface p-5", className)}>
      <header className="flex items-center justify-between gap-3">
        <h3 className="text-body-md-strong text-fg">{title}</h3>
        <ol aria-label="Progress" className="flex items-center gap-1.5">
          {questions.map((q, i) => (
            <li key={q.id} aria-current={i === index ? "step" : undefined} className="flex">
              <span className="sr-only">
                Question {i + 1}
                {i < index ? ", answered" : ""}
              </span>
              <motion.span
                aria-hidden
                layout
                transition={reduceMotion ? { duration: 0 } : layoutSpring}
                className={cx("h-1.5 rounded-full", i === index ? "w-5 bg-accent-500" : i < index || reviewing ? "w-1.5 bg-accent-500/50" : "w-1.5 bg-chart-track")}
              />
            </li>
          ))}
        </ol>
      </header>

      <div aria-live="polite" className="sr-only">
        {sent ? "Answers sent" : reviewing ? "Review your answers" : `Question ${index + 1} of ${questions.length}: ${question?.prompt}`}
      </div>

      <div className="relative -m-1 overflow-hidden p-1">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={sent ? "sent" : index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: reduceMotion ? { duration: 0 } : layoutSpring, opacity: { duration: 0.18, ease: easing.standard } }}
            className="flex flex-col gap-4"
          >
            {sent ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <span className="flex size-10 items-center justify-center rounded-full bg-status-success text-status-success-text">
                  <RiCheckLine aria-hidden className="size-5" />
                </span>
                <p className="text-body-md-strong text-fg">Thanks, that's everything.</p>
                <p className="text-body-sm text-fg-secondary">The plan will use these answers.</p>
              </div>
            ) : reviewing ? (
              <>
                <p className="text-title-sm-emphasis text-fg">Look right?</p>
                <dl className="flex flex-col divide-y divide-line rounded-xl border border-line">
                  {questions.map((q, i) => (
                    <div key={q.id} className="flex items-start justify-between gap-4 px-3 py-2.5">
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <dt className="text-body-sm text-fg-secondary">{q.prompt}</dt>
                        <dd className="text-body-md-strong text-fg">{labelFor(q, answers[q.id])}</dd>
                      </div>
                      <Button size="xs" variant="tertiary" onPress={() => go(i)} aria-label={`Change answer to: ${q.prompt}`}>
                        Change
                      </Button>
                    </div>
                  ))}
                </dl>
              </>
            ) : question ? (
              <>
                <div className="flex flex-col gap-1">
                  <p className="text-caption-strong text-fg-secondary">
                    Question {index + 1} of {questions.length}
                    {question.multiple ? " · choose any" : ""}
                  </p>
                  <p id={`${question.id}-prompt`} className="text-title-sm-emphasis text-fg">
                    {question.prompt}
                  </p>
                  {question.description && <p className="text-body-md text-fg-secondary">{question.description}</p>}
                </div>

                {question.multiple ? (
                  <CheckboxGroup
                    aria-labelledby={`${question.id}-prompt`}
                    value={answer?.selected ?? []}
                    onChange={(selected) => setAnswer({ selected })}
                    className="grid gap-2 sm:grid-cols-2"
                  >
                    {question.options.map((o) => (
                      <CheckboxCard key={o.id} value={o.id} title={o.label} description={o.description} />
                    ))}
                    {question.allowOther && <CheckboxCard value={OTHER} title="Other" description="Something else" />}
                  </CheckboxGroup>
                ) : (
                  <RadioGroup
                    aria-labelledby={`${question.id}-prompt`}
                    value={answer?.selected[0] ?? null}
                    onChange={(value) => setAnswer({ selected: [value] })}
                    className="grid gap-2 sm:grid-cols-2"
                  >
                    {question.options.map((o) => (
                      <RadioCard key={o.id} value={o.id} title={o.label} description={o.description} />
                    ))}
                    {question.allowOther && <RadioCard value={OTHER} title="Other" description="Something else" />}
                  </RadioGroup>
                )}

                {answer?.selected.includes(OTHER) && (
                  <Input
                    autoFocus
                    label="Your answer"
                    placeholder="Type your answer"
                    value={answer.other ?? ""}
                    onChange={(other) => setAnswer({ other })}
                  />
                )}
              </>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      {!sent && (
        <footer className="flex items-center justify-between gap-3 border-t border-line pt-4">
          <Button variant="tertiary" isDisabled={index === 0} onPress={() => go(index - 1)}>
            Back
          </Button>
          <div className="flex items-center gap-2">
            {question?.optional && !answered && (
              <Button variant="secondary" onPress={() => go(index + 1)}>
                Skip
              </Button>
            )}
            {reviewing ? (
              <Button
                onPress={() => {
                  onComplete?.(answers);
                  setSent(true);
                }}
              >
                {submitLabel}
              </Button>
            ) : (
              <Button isDisabled={!answered && !question?.optional} onPress={() => go(index + 1)}>
                {index === questions.length - 1 ? "Review" : "Next"}
              </Button>
            )}
          </div>
        </footer>
      )}
    </section>
  );
}
