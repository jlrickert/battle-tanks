export type Result<T, E> = Ok<T> | Err<E>;

export type Ok<T> = {
	success: true;
	value: T;
};

export type Err<E> = {
	success: false;
	error: E;
};

export const tryCatch = <A, E>(f: () => A, onErr: (error: unknown) => E) => {
	try {
		return {
			success: true,
			value: f(),
		};
	} catch (error) {
		return {
			success: false,
			error: onErr(error),
		};
	}
};

export const absurd = <A>(_: never): A => {
	throw new Error("This is absurd");
};

export type TaskResult<T, E> = Promise<Result<T, E>>;

export const fromPromise = async <T, E>(
	f: () => Promise<T>,
	onErr: (error: unknown) => E,
): TaskResult<T, E> => {
	try {
		const value = await f();
		return { success: true, value };
	} catch (e) {
		const error = onErr(e);
		return { success: false, error };
	}
};

export const debounce = <FN extends (...args: any[]) => void>(
	cb: FN,
	wait = 500,
): FN => {
	let timeout: ReturnType<typeof setTimeout>;

	return ((...args: any[]) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			cb(...args);
		}, wait);
	}) as any;
};

export const identity = <A>(a: A): A => a;
