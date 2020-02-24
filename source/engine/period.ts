import { convertToDate, getRelativeDate } from 'Engine/date'

export type Period<Date> = {
	start: Date | null
	end: Date | null
}

export function parsePeriod<Date>(word: string, date: Date): Period<Date> {
	const startWords = [
		'depuis',
		'depuis le',
		'depuis la',
		'à partir de',
		'à partir du',
		'du'
	]
	const endWords = [
		"jusqu'à",
		"jusqu'au",
		"jusqu'à la",
		'avant',
		'avant le',
		'avant la',
		'au'
	]
	const intervalWords = ['le', 'en']
	if (!startWords.concat(endWords, intervalWords).includes(word)) {
		throw new SyntaxError(
			`Le mot clé '${word}' n'est pas valide. Les mots clés possible sont les suivants :\n\t ${startWords.join(
				', '
			)}`
		)
	}
	if (word === 'le') {
		return {
			start: date,
			end: date
		}
	}
	if (word === 'en') {
		console.log(word, date)
		return { start: null, end: null }
	}
	if (startWords.includes(word)) {
		return {
			start: date,
			end: null
		}
	}
	if (endWords.includes(word)) {
		return {
			start: null,
			end: date
		}
	}
	throw new Error('Non implémenté')
}

// Idée : une évaluation est un n-uple : (value, unit, missingVariable, isApplicable)
// Une temporalEvaluation est une liste d'evaluation sur chaque période. : [(Evaluation, Period)]
type Evaluation<T> = T | false | null

type EvaluatedNode<T> = {
	nodeValue: Evaluation<T>
	temporalValue?: Temporal<Evaluation<T>>
}

type TemporalNode<T> = Temporal<{ nodeValue: Evaluation<T> }>
export type Temporal<T> = Array<Period<string> & { value: T }>

export function narrowTemporalValue<T>(
	period: Period<string>,
	temporalValue: Temporal<Evaluation<T>>
): Temporal<Evaluation<T>> {
	return liftTemporal2(
		(value, filter) => filter && value,
		temporalValue,
		createTemporalEvaluation(true, period)
	)
}

// Returns a temporal value that's true for the given period and false otherwise.
export function createTemporalEvaluation<T>(
	value: Evaluation<T>,
	period: Period<string> = { start: null, end: null }
): Temporal<Evaluation<T>> {
	let temporalValue = [{ ...period, value }]
	if (period.start != null) {
		temporalValue.unshift({
			start: null,
			end: getRelativeDate(period.start, -1),
			value: false
		})
	}
	if (period.end != null) {
		temporalValue.push({
			start: getRelativeDate(period.end, 1),
			end: null,
			value: false
		})
	}
	return temporalValue
}

export function pure<T>(value: T): Temporal<T> {
	return [{ start: null, end: null, value }]
}

export function mapTemporal<T1, T2>(
	fn: (value: T1) => T2,
	temporalValue: Temporal<T1>
): Temporal<T2> {
	return temporalValue.map(({ start, end, value }) => ({
		start,
		end,
		value: fn(value)
	}))
}

function liftTemporal2<T1, T2, T3>(
	fn: (value1: T1, value2: T2) => T3,
	temporalValue1: Temporal<T1>,
	temporalValue2: Temporal<T2>
): Temporal<T3> {
	return mapTemporal(
		([a, b]) => fn(a, b),
		zipTemporals(temporalValue1, temporalValue2)
	)
}

export function concatTemporals<T, U>(
	temporalValues: Array<Temporal<T>>
): Temporal<Array<T>> {
	return temporalValues.reduce(
		(values, value) => liftTemporal2((a, b) => [...a, b], values, value),
		pure([]) as Temporal<Array<T>>
	)
}

export function liftTemporalNode<T>(node: EvaluatedNode<T>): TemporalNode<T> {
	const { temporalValue, ...baseNode } = node
	if (!temporalValue) {
		return pure(baseNode)
	}
	return mapTemporal(
		nodeValue => ({
			...baseNode,
			nodeValue
		}),
		temporalValue
	)
}

export function zipTemporals<T1, T2>(
	temporalValue1: Temporal<T1>,
	temporalValue2: Temporal<T2>,
	acc: Temporal<[T1, T2]> = []
): Temporal<[T1, T2]> {
	if (!temporalValue1.length && !temporalValue2.length) {
		return acc
	}
	const [value1, ...rest1] = temporalValue1
	const [value2, ...rest2] = temporalValue2
	console.assert(value1.start === value2.start)
	const endDateComparison = compareEndDate(value1.end, value2.end)

	// End dates are equals
	if (endDateComparison === 0) {
		return zipTemporals(rest1, rest2, [
			...acc,
			{ ...value1, value: [value1.value, value2.value] }
		])
	}
	// Value1 lasts longuer than value1
	if (endDateComparison > 0) {
		console.assert(value2.end !== null)
		return zipTemporals(
			[
				{ ...value1, start: getRelativeDate(value2.end as string, 1) },
				...rest1
			],
			rest2,
			[
				...acc,
				{
					...value2,
					value: [value1.value, value2.value]
				}
			]
		)
	}

	// Value2 lasts longuer than value1
	if (endDateComparison < 0) {
		console.assert(value1.end !== null)
		return zipTemporals(
			rest1,
			[
				{ ...value2, start: getRelativeDate(value1.end as string, 1) },
				...rest2
			],
			[
				...acc,
				{
					...value1,
					value: [value1.value, value2.value]
				}
			]
		)
	}
	throw new EvalError('All case should have been covered')
}

function simplify<T>(temporalValue: Temporal<T>): Temporal<T> {
	return temporalValue
}

function compareStartDate(
	dateA: string | null,
	dateB: string | null
): -1 | 0 | 1 {
	if (dateA == dateB) {
		return 0
	}
	if (dateA == null) {
		return -1
	}
	if (dateB == null) {
		return 1
	}
	return convertToDate(dateA) < convertToDate(dateB) ? -1 : 1
}

function compareEndDate(
	dateA: string | null,
	dateB: string | null
): -1 | 0 | 1 {
	if (dateA == dateB) {
		return 0
	}
	if (dateA == null) {
		return 1
	}
	if (dateB == null) {
		return -1
	}
	return convertToDate(dateA) < convertToDate(dateB) ? -1 : 1
}

export function periodAverage(
	temporalValue: Temporal<Evaluation<number>>
): Evaluation<number> {
	temporalValue = temporalValue.filter(({ value }) => value !== false)
	const first = temporalValue[0]
	const last = temporalValue[temporalValue.length - 1]
	if (!temporalValue.length) {
		return false
	}

	// La variable est définie sur un interval infini
	if (first.start == null || last.end == null) {
		if (first.start != null) {
			return last.value
		}
		if (last.end != null) {
			return first.value
		}
		return first.value + last.value / 2
	}

	if (temporalValue.some(({ value }) => value == null)) {
		return null
	}
	let totalWeight = 0
	const weights = temporalValue.map(({ start, end, value }) => {
		const day = 1000 * 60 * 60 * 24
		const weight =
			convertToDate(end as string).getTime() -
			convertToDate(start as string).getTime() +
			day
		totalWeight += weight
		return (value as number) * weight
	})
	return weights.reduce(
		(average, weightedValue) => average + weightedValue / totalWeight,
		0
	)
}