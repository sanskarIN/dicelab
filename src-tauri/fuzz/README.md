# Rust parser fuzzing

DiceLab includes a coverage-guided `cargo-fuzz` target for the native dice-expression parser.

## Prerequisites

Install the Rust nightly toolchain and `cargo-fuzz` in a network-enabled development environment:

```bash
rustup toolchain install nightly
cargo install cargo-fuzz --locked
```

## Run the parser target

From `src-tauri`:

```bash
cargo +nightly fuzz run parser
```

For a bounded local smoke campaign:

```bash
cargo +nightly fuzz run parser -- -max_total_time=60
```

The target accepts arbitrary UTF-8 input and exercises the production parser through the `fuzzing` feature gate. Whenever parsing succeeds, it verifies that the normalized expression parses again and preserves the parsed count, side count, modifier, and normalized representation.

## Corpus and artifacts

`cargo-fuzz` manages generated corpus and crash artifacts under `src-tauri/fuzz`. Generated corpus, target output, and crash artifacts are intentionally ignored by Git; minimized regression cases that reveal a bug should instead be converted into a normal Rust unit test before the fix is merged.

## Failure handling

1. Re-run the exact crashing input to confirm reproduction.
2. Add a focused regression test to `src-tauri/src/lib.rs`.
3. Fix the parser without weakening existing validation limits.
4. Run `cargo test`, `cargo clippy --all-targets --all-features -- -D warnings`, and the fuzz target again.
5. Keep raw fuzz artifacts out of releases and repository history.
