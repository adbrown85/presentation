INPUT   := presentation.markdown
OUTPUT  := presentation.pdf

all: $(OUTPUT)
$(OUTPUT): $(INPUT)
	@pandoc -t beamer $< -o $@
clean:
	@$(RM) $(OUTPUT)
view: $(OUTPUT)
	@open $<
