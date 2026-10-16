/*
 * Copyright (c) 2026 Yuli Liu — YAO LAB / 爻间.
 * Original software: PolyForm Shield License 1.0.0; see LICENSE and NOTICE.
 * Classical text content and third-party materials have separate terms.
 */
/* English editorial reflections, not translations of the classical I Ching. */
window.YaoEnReading = (()=>{
const rows = {
1:['The Creative','Taking initiative','Energy is best used to begin something definite, not merely to feel confident.','Choose one clear objective and take a measurable first step.'],
2:['The Receptive','Steady support','Not every situation improves through force; preparation and cooperation can matter more.','Listen carefully, establish a sound foundation, and move consistently.'],
3:['Difficulty at the Beginning','Starting amid uncertainty','New ventures often feel disordered before their basic structures emerge.','Reduce the scope, find support, and stabilize your first process.'],
4:['Youthful Folly','Learning to ask','The most important step may be understanding the problem before seeking an answer.','Seek reliable guidance and clarify what you do not yet know.'],
5:['Waiting','Preparing with patience','Uncertainty does not always call for immediate action; readiness has value.','Define a review date and prepare resources while you wait.'],
6:['Conflict','Handling disagreement','An escalating dispute can obscure the original goal.','Check the facts, clarify boundaries, and seek constructive mediation.'],
7:['The Army','Coordination and discipline','Shared purpose requires clear roles and dependable execution.','Name the responsibilities and establish feedback points.'],
8:['Holding Together','Trust and alliance','Connection matters when people actually share the same goals.','Confirm mutual expectations before making commitments.'],
9:['Small Taming','Growing through small steps','Visible but modest progress can be the start of a more durable result.','Keep iterating in small, evidence-based increments.'],
10:['Treading','Moving with care','Progress is possible when you respect the rules and the context.','Map the risks before proceeding deliberately.'],
11:['Peace','Conditions in alignment','Cooperation and available resources may be working together well.','Use the opening, but keep a mechanism for review.'],
12:['Standstill','Blocked channels','When communication or access is restricted, pushing harder is not always effective.','Protect what works and look for an alternative route.'],
13:['Fellowship','Shared purpose','Collective goals can overcome individual differences when responsibility is real.','Make the goal explicit and invite genuine collaboration.'],
14:['Great Possession','Using resources wisely','Having opportunities is different from allocating them well.','Prioritize the outcome that matters and budget your effort.'],
15:['Modesty','Confidence without display','Quiet competence often earns trust over time.','Invite feedback while stating your contribution clearly.'],
16:['Enthusiasm','Turning momentum into plans','Shared excitement brings energy, but also the risk of overpromising.','Translate motivation into a timeline and realistic commitments.'],
17:['Following','Choosing what to follow','Responsiveness helps when the direction is worth following.','Test whether the example you follow matches your values.'],
18:['Work on What Has Been Spoiled','Repair and renewal','Recurring difficulties can indicate a structure that needs attention.','Identify the underlying cause rather than fixing the symptom alone.'],
19:['Approach','Meeting an opportunity','A timely opening invites engagement and responsibility.','Move closer with a realistic plan and clear expectations.'],
20:['Contemplation','Seeing the larger picture','A change in perspective can reveal what immediate action misses.','Observe patterns, then decide which signal matters.'],
21:['Biting Through','Resolving an obstacle','A specific unresolved barrier may be blocking wider progress.','Identify the obstacle and address it directly and proportionately.'],
22:['Grace','Form and substance','Presentation can help an idea be seen, but should not replace substance.','Improve clarity without overlooking the essential work.'],
23:['Splitting Apart','Facing erosion','Some structures must be stabilized or simplified before they can grow.','Protect essentials and stop losses before expanding.'],
24:['Return','Beginning again','A small return to the right rhythm can be a meaningful turning point.','Restart with one sustainable habit.'],
25:['Innocence','Acting without pretense','A simple, transparent approach may outperform overcalculation.','Make a straightforward plan and verify your assumptions.'],
26:['Great Taming','Strength through restraint','Capacity grows when energy is contained and developed patiently.','Train skills and preserve resources for the right opening.'],
27:['Nourishment','What sustains growth','Inputs—information, relationships, routines—shape the outcome.','Review what you consume and what genuinely supports you.'],
28:['Great Exceeding','Excessive pressure','A structure carrying too much weight needs reinforcement or relief.','Reduce overload and address the most fragile point.'],
29:['The Abysmal','Repeated difficulty','Recurring uncertainty calls for discipline and protective habits.','Use small safeguards and seek reliable evidence.'],
30:['The Clinging','Clarity and attention','Understanding improves when important things are made visible.','Clarify your reasoning and check what deserves attention.'],
31:['Influence','Mutual responsiveness','Connections grow through two-way response, not assumed feelings.','Notice real actions and communicate openly.'],
32:['Duration','Sustaining commitment','Durable progress depends on rhythms that can be maintained.','Choose a routine you can realistically keep.'],
33:['Retreat','Strategic distance','Stepping away can preserve choice rather than signal defeat.','Create room to reassess the situation and your limits.'],
34:['Great Power','Power with judgment','More influence makes restraint and timing more important.','Use your advantages responsibly rather than forcing results.'],
35:['Progress','Making progress visible','Recognition may follow tangible work, not just intention.','Document what has improved and use the momentum wisely.'],
36:['Darkening of the Light','Protecting clarity','A difficult environment may require discretion and inner steadiness.','Keep your priorities clear and choose when to speak.'],
37:['The Family','Roles and relationships','Stable groups work best when expectations are understood.','Clarify responsibilities and communicate with respect.'],
38:['Opposition','Working across differences','Difference need not end cooperation when the essentials align.','Distinguish negotiable preferences from genuine incompatibilities.'],
39:['Obstruction','Rerouting around barriers','When the direct path is blocked, context and support become crucial.','Seek a viable detour and trusted advice.'],
40:['Deliverance','Releasing a burden','After a tense phase, the first task is often to reduce unnecessary pressure.','Remove one constraint and reset the next step.'],
41:['Decrease','Simplifying to focus','Less can become more when it frees resources for the essential.','Cut one low-value commitment and protect the highest priority.'],
42:['Increase','Investing in shared gain','Improvement is stronger when benefits and effort are aligned.','Direct new resources toward durable progress.'],
43:['Breakthrough','Making a clear decision','A decision may be overdue, but it still needs proportion and evidence.','State the issue clearly and choose a defensible next step.'],
44:['Coming to Meet','An unexpected encounter','An attractive opening deserves both curiosity and discernment.','Check the terms and risks before committing.'],
45:['Gathering Together','Bringing people together','Shared momentum is useful when coordination stays intentional.','Define what the group is actually gathering to achieve.'],
46:['Pushing Upward','Gradual ascent','Progress can be cumulative even when each step is small.','Build a practical sequence and measure each stage.'],
47:['Oppression','Working under constraint','Limited energy or resources require especially careful priorities.','Reduce avoidable burdens and ask for appropriate support.'],
48:['The Well','Renewable resources','Enduring value may come from improving a shared foundation.','Maintain the resource or routine others depend on.'],
49:['Revolution','Making necessary change','A genuine shift needs a reason, a window, and support.','Explain the need for change and stage the transition.'],
50:['The Cauldron','Transforming what you have','Raw resources become valuable through process and care.','Invest in the system that turns effort into useful results.'],
51:['The Arousing','Responding to a shock','A sudden event can disrupt plans without defining the future.','Regain composure, verify what changed, and address the urgent facts.'],
52:['Keeping Still','Knowing when to stop','Pausing deliberately can prevent a small problem from growing.','Create a boundary and review before moving again.'],
53:['Development','Growing over time','Patient sequencing can build results that endure.','Make the next stage achievable before expanding.'],
54:['The Marrying Maiden','Unequal expectations','A relationship or agreement may involve unclear roles and power.','Examine expectations and retain your ability to choose.'],
55:['Abundance','Managing a high point','Periods of intensity require focus and good allocation.','Use momentum without ignoring future maintenance.'],
56:['The Wanderer','Navigating unfamiliar ground','When you are new to a setting, observation matters.','Learn local norms and keep a flexible plan.'],
57:['The Gentle','Influence through persistence','Small repeated actions can change a situation over time.','Choose a consistent, respectful way to make progress.'],
58:['The Joyous','Open exchange','Encouraging dialogue helps when it remains sincere.','Share expectations honestly and listen for real feedback.'],
59:['Dispersion','Untangling what is scattered','Clarity can return when confusion and distance are addressed.','Rebuild communication and concentrate shared attention.'],
60:['Limitation','Useful boundaries','Constraints can create focus if they are fair and workable.','Choose limits that protect progress rather than block it.'],
61:['Inner Truth','Trust and consistency','Credibility comes from how words and actions match.','Check the evidence and communicate candidly.'],
62:['Small Exceeding','Attention to detail','Small-scale decisions deserve care when the margin for error is narrow.','Proceed modestly and verify the details.'],
63:['After Completion','Maintaining a result','A finished phase may still need vigilance and adjustments.','Document what works and monitor emerging risks.'],
64:['Before Completion','The unfinished threshold','Being close to a goal does not remove the final uncertainties.','Close the remaining gaps before calling the work done.']
};
const trigrams={乾:'Heaven',坤:'Earth',震:'Thunder',巽:'Wind',坎:'Water',离:'Fire',艮:'Mountain',兑:'Lake'};
const pos=[
 ['Foundation','Review the starting conditions and make the first step reliable.'],
 ['Execution','Look at daily practice, cooperation, and the methods you use.'],
 ['Friction','Identify a point where haste or conflicting demands could cause trouble.'],
 ['Transition','Look for a changing role, relationship, or external constraint.'],
 ['Responsibility','Clarify who makes decisions and on what evidence.'],
 ['Closure','Consider how to conclude, reset, or avoid overextension.']
];
const topic={general:'Use this as a reflection prompt and test one concrete step.',study:'Compare your study plan with actual feedback and recent results.',career:'Check deliverables, available resources, and clear commitments.',relationship:'Focus on mutual communication and consent, not guesses about feelings.',money:'Use verified numbers, a budget, and independent financial judgment.',life:'Compare realistic options, trade-offs, and reversible next steps.'};
function r(n){const [name,theme,state,action]=rows[n]||rows[11];return {name,theme,state,action,trend:'A perspective to explore',risk:'Avoid treating a symbolic reading as evidence of what will happen.',verdict:state};}
return {rows,r,pos,topic,trigrams,hex:n=>{let v=r(n);return `#${String(n).padStart(2,'0')} ${v.name}`;}};
})();
